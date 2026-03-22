# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json

from genlayer import *


class DevContractShield(gl.Contract):
    """
    Escrow inteligente para entregables de codigo.

    Flujo MVP:
      1. Se despliega con client, developer, monto y stack
      2. El client fondea con fund_contract() (payable)
      3. La plataforma envia evidencia con submit_evidence()
      4. El LLM adjudica: accepted o rejected
      5. Se libera pago o reembolso segun resultado
    """

    # --- Participantes ---
    client: str
    developer: str
    owner: str  # quien despliega (la plataforma)

    # --- Escrow ---
    amount: u256          # monto acordado
    funded_amount: u256   # monto real depositado
    language_or_stack: str

    # --- Contexto del contrato ---
    title: str
    description: str
    acceptance_rule: str  # regla definida por el cliente al crear el contrato

    # --- Hashes de trazabilidad ---
    official_test_pack_hash: str
    submission_code_hash: str
    evidence_bundle_hash: str

    # --- Estado ---
    state: str  # Created | Funded | Submitted | UnderReview | Approved | Rejected | Appealed | Finalized

    # --- Adjudicacion ---
    result: str          # pending | accepted | rejected
    result_reason: str
    proposed_result: str  # lo que propuso la plataforma

    # --- Disputa (visual MVP) ---
    dispute_reason: str

    def __init__(self, client: str, developer: str, amount: str, language_or_stack: str, title: str, description: str, acceptance_rule: str) -> None:
        self.client = client
        self.developer = developer
        self.owner = str(gl.message.sender_address)
        self.amount = u256(int(amount))
        self.funded_amount = u256(0)
        self.language_or_stack = language_or_stack

        self.title = title
        self.description = description
        self.acceptance_rule = acceptance_rule

        self.official_test_pack_hash = ""
        self.submission_code_hash = ""
        self.evidence_bundle_hash = ""

        self.state = "Created"
        self.result = "pending"
        self.result_reason = ""
        self.proposed_result = ""
        self.dispute_reason = ""

    # ----------------------------------------------------------------
    # FUNDING
    # ----------------------------------------------------------------
    @gl.public.write.payable
    def fund_contract(self) -> None:
        """El client deposita GEN en el escrow."""
        if self.state != "Created":
            exit("Solo se puede fondear en estado Created")

        # Registrar el deposito - gl.message.value contiene el monto enviado
        received = gl.message.value
        self.funded_amount = self.funded_amount + received
        self.state = "Funded"

    # ----------------------------------------------------------------
    # REGISTRO DE HASHES (off-chain -> on-chain)
    # ----------------------------------------------------------------
    @gl.public.write
    def set_test_pack_hash(self, hash_value: str) -> None:
        """Registra el hash del test pack oficial aprobado."""
        if self.state not in ("Created", "Funded"):
            exit("No se puede cambiar el test pack en este estado")
        self.official_test_pack_hash = hash_value

    @gl.public.write
    def set_submission_hash(self, code_hash: str) -> None:
        """Registra el hash del codigo entregado por el developer."""
        if self.state != "Funded":
            exit("El contrato debe estar fondeado para recibir entrega")
        self.submission_code_hash = code_hash
        self.state = "Submitted"

    # ----------------------------------------------------------------
    # ADJUDICACION
    # ----------------------------------------------------------------
    @gl.public.write
    def submit_evidence(self, evidence_summary: str) -> None:
        """
        La plataforma envia el resumen de evidencia.
        El LLM adjudica si cumple la regla de aceptacion binaria del MVP:
          accepted = (layer_a_pass_rate == 1.0) AND (layer_c_status == "pass")
          rejected = cualquier otro caso
        """
        if self.state not in ("Submitted", "Funded"):
            exit("No se puede enviar evidencia en estado: " + self.state)

        self.state = "UnderReview"

        # Guardar hash del bundle
        try:
            evidence_data = json.loads(evidence_summary)
            self.evidence_bundle_hash = evidence_data.get("evidence_bundle_hash", "")
            self.proposed_result = evidence_data.get("proposed_result", "")
        except Exception:
            pass

        # Leer valores a variables locales para el bloque no-determinista
        # (copy_to_memory solo funciona con tipos de storage GenLayer, no con str)
        title_copy = self.title
        description_copy = self.description
        acceptance_rule_copy = self.acceptance_rule
        language_copy = self.language_or_stack
        test_pack_hash_copy = self.official_test_pack_hash

        def adjudicate() -> str:
            prompt = f"""You are an impartial technical arbitrator for DevContractShield, a code delivery escrow platform.

            Your role is to evaluate whether the developer's delivery meets the acceptance rule defined by the client at contract creation time.

            ---
            CONTRACT:
            - Title: {title_copy}
            - Description: {description_copy}
            - Test pack hash: {test_pack_hash_copy}

            ACCEPTANCE RULE (defined by the client — apply it exactly as written):
            {acceptance_rule_copy}

            ---
            TECHNICAL EVIDENCE (submitted by the platform after running the test suite):
            {evidence_summary}

            ---
            EVIDENCE STRUCTURE REFERENCE:
            - layer_a: Client-defined tests (pass_rate must be 1.0 for acceptance)
            - layer_b: Informative AI-suggested tests (MUST NOT affect your decision)
            - layer_c: Linter + runner exit code (status must be "pass" for acceptance)

            ---
            INSTRUCTIONS:
            1. Read the acceptance rule defined by the client.
            2. Extract layer_a.pass_rate and layer_c.status from the evidence.
            3. Apply the acceptance rule strictly and impartially.
            4. Do not interpret layer_b. Do not add conditions beyond what the client wrote.
            5. Respond ONLY with a valid JSON object using this exact format:

            {{
            "verdict": "ACCEPTED" | "REJECTED",
            "reason": "<one sentence explaining which condition passed or failed>",
            "layer_a_pass_rate": <float extracted from evidence>,
            "layer_c_status": "<string extracted from evidence>",
            "rule_applied": "<verbatim copy of the client acceptance rule>"
            }}

            It is mandatory that you respond only using the JSON format above,
            nothing else. Don't include any other words or characters,
            your output must be only JSON without any formatting prefix or suffix.
            This result should be perfectly parsable by a JSON parser without errors."""

            return gl.nondet.exec_prompt(prompt)

        llm_response = gl.eq_principle.prompt_comparative(
            adjudicate,
            principle="Both evaluations must produce a JSON object with the same verdict (ACCEPTED or REJECTED). The verdict is determined solely by applying the client acceptance rule to layer_a_pass_rate and layer_c_status. layer_b must not influence the result.",
        )

        # Parsear respuesta JSON del LLM
        try:
            parsed = json.loads(llm_response.strip())
            verdict = parsed.get("verdict", "").upper()
            reason = parsed.get("reason", "")
        except Exception:
            # Fallback si el LLM no responde JSON valido
            verdict = "REJECTED"
            reason = "Error al parsear respuesta del adjudicador."

        if verdict == "ACCEPTED":
            self.result = "accepted"
            self.state = "Approved"
        else:
            self.result = "rejected"
            self.state = "Rejected"

        self.result_reason = reason

    # ----------------------------------------------------------------
    # PAGO / REEMBOLSO
    # ----------------------------------------------------------------
    @gl.public.write
    def release_payment(self) -> None:
        """Libera fondos al developer. Solo si estado es Approved."""
        if self.state != "Approved":
            exit("Solo se puede liberar pago en estado Approved")
        if self.result != "accepted":
            exit("El resultado debe ser accepted para liberar pago")
        self.state = "Finalized"

    @gl.public.write
    def refund_client(self) -> None:
        """Reembolsa al client. Solo si estado es Rejected."""
        if self.state != "Rejected":
            exit("Solo se puede reembolsar en estado Rejected")
        if self.result != "rejected":
            exit("El resultado debe ser rejected para reembolsar")
        self.state = "Finalized"

    # ----------------------------------------------------------------
    # DISPUTA (visual MVP - sin logica on-chain real)
    # ----------------------------------------------------------------
    @gl.public.write
    def open_dispute(self, reason: str) -> None:
        """Registra intencion de disputa (solo visual en MVP)."""
        if self.state not in ("Approved", "Rejected"):
            exit("Solo se puede disputar despues de la adjudicacion")
        self.dispute_reason = reason
        self.state = "Appealed"

    # ----------------------------------------------------------------
    # VISTAS
    # ----------------------------------------------------------------
    @gl.public.view
    def get_contract_info(self) -> dict:
        """Retorna toda la info del contrato."""
        return {
            "client": self.client,
            "developer": self.developer,
            "amount": str(self.amount),
            "funded_amount": str(self.funded_amount),
            "language_or_stack": self.language_or_stack,
            "title": self.title,
            "description": self.description,
            "acceptance_rule": self.acceptance_rule,
            "state": self.state,
            "result": self.result,
            "result_reason": self.result_reason,
            "official_test_pack_hash": self.official_test_pack_hash,
            "submission_code_hash": self.submission_code_hash,
            "evidence_bundle_hash": self.evidence_bundle_hash,
            "dispute_reason": self.dispute_reason,
        }

    @gl.public.view
    def get_result(self) -> dict:
        """Retorna solo el resultado de adjudicacion."""
        return {
            "result": self.result,
            "reason": self.result_reason,
            "state": self.state,
            "proposed_result": self.proposed_result,
        }

    @gl.public.view
    def get_state(self) -> str:
        """Retorna el estado actual del contrato."""
        return self.state
