(() => {
  "use strict";

  const cfg = Object.assign(
    { backendUrl: "" },
    window.MH_PARENT_PERMISSION_CONFIG || {}
  );

  const app = document.getElementById("mh-parent-permission-app");
  const statusEl = document.getElementById("parent-permission-status");

  if (!app) return;

  const requestId =
    new URLSearchParams(window.location.search).get("request") || "";

  const state = {
    requestId,
    requestValidated: false,
    decision: "",
    signatureDataUrl: "",
    signedAt: "",
    pin: "",
    submitted: false
  };

  const STUDY_TITLE =
    "Mental Health, Coping, Grit, and Perceived Stress Among Tertiary-Level Students in Belize";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(message = "", kind = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "survey-status";
    if (kind) statusEl.classList.add(`survey-status-${kind}`);
  }

  function setBusy(button, busy, busyText = "Submitting...") {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  }

  async function post(payload) {
    if (!cfg.backendUrl || cfg.backendUrl.includes("PASTE_")) {
      throw new Error("The study permission service has not been configured.");
    }

    const response = await fetch(cfg.backendUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (_) {
      throw new Error("The study server returned an invalid response.");
    }

    if (!response.ok || !result || result.ok !== true) {
      throw new Error(
        result && result.error
          ? result.error
          : "The request could not be completed."
      );
    }

    return result;
  }

  function renderInvalidRequest(message) {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission</h2>
        <p><strong>This permission link could not be verified.</strong></p>
        <p>${escapeHtml(message)}</p>
        <p>If you believe you received this message in error, please contact:</p>
        <p>
          Joy Lee-Shi, MA<br>
          Faculty of Management &amp; Social Sciences, University of Belize<br>
          <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a>
        </p>
      </div>
    `;
  }

  async function validateRequest() {
    if (!requestId) {
      renderInvalidRequest(
        "The permission-request code is missing from this link."
      );
      return;
    }

    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission</h2>
        <p>Checking your permission link...</p>
      </div>
    `;

    try {
      const result = await post({
        action: "get_guardian_permission_request",
        permission_request_id: requestId
      });

      if (!result.found) {
        renderInvalidRequest("This permission request was not found.");
        return;
      }

      if (
        result.permission_status === "granted" ||
        result.permission_status === "declined"
      ) {
        renderInvalidRequest(
          "This parent/guardian permission request has already been completed."
        );
        return;
      }

      state.requestValidated = true;
      renderPermissionForm();
    } catch (err) {
      renderInvalidRequest(err.message);
    }
  }

  function renderPermissionForm() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Study Information &amp; Permission Form</h2>

        <p><strong>Study Title:</strong> ${STUDY_TITLE}</p>

        <p><strong>Principal Investigators:</strong><br>
          Joy Lee-Shi, MA<br>
          Faculty of Management &amp; Social Sciences, University of Belize<br>
          Email: <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a>
        </p>

        <p>
          Mathias R. Vairez Jr., PhD<br>
          Department of Education, University of Belize<br>
          Email: <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a>
        </p>

        <h3>Why am I receiving this?</h3>
        <p>Your teenager has expressed interest in participating in this research study and provided your email address so that permission could be requested from a parent or legal guardian.</p>
        <p>Because your teenager is under 18 years of age, your permission is required before they can participate. Please read the information below carefully before deciding whether to give permission.</p>
        <p>Even if you give permission, the student will still need to decide for themselves whether they wish to participate. They will be asked to review a consent form and voluntarily agree before they can access the study.</p>

        <h3>Purpose of the Study</h3>
        <p>The purpose of this study is to better understand tertiary-level students' experiences with mental health, coping skills, grit, and perceived stress. The study also aims to evaluate whether the instruments used are appropriate and valid for assessing these experiences among tertiary-level students in Belize.</p>

        <h3>What will the student be asked to do?</h3>
        <p>If you give permission and your teenager agrees to participate, they will complete an online survey containing questions about:</p>
        <ul>
          <li>demographic information;</li>
          <li>perceived stress;</li>
          <li>symptoms associated with anxiety and depression;</li>
          <li>coping strategies; and</li>
          <li>perseverance or grit.</li>
        </ul>
        <p>The survey is expected to take approximately <strong>10–20 minutes</strong> to complete.</p>
        <p>Your teen may complete the survey using their own internet-enabled device from a location and time of their choosing.</p>

        <h3>Are there any risks or discomforts?</h3>
        <p>Some questions address potentially sensitive topics, including stress, symptoms associated with anxiety and depression, mental health history, and coping behaviours. Your teen may experience temporary emotional discomfort or may reflect on personal difficulties while answering these questions.</p>
        <p>To reduce these risks, your teen will be informed that they may skip any question they do not wish to answer and may stop participating at any time before submitting the survey without penalty.</p>
        <p>After completing the survey, your teen will receive a debriefing sheet containing general information about the questionnaires used in the study, links where they may learn more about the measures, and information about mental health and support resources in Belize.</p>

        <h3>Are there any benefits?</h3>
        <p>There is no guaranteed direct benefit from participating. However, your teen may find reflecting on topics such as stress, coping, and perseverance informative.</p>
        <p>The findings may contribute to a better understanding of the mental health and well-being of tertiary-level students in Belize. The study may also contribute to determining whether commonly used psychological questionnaires are appropriate for use with tertiary-level students in Belize.</p>

        <h3>How will privacy and confidentiality be protected?</h3>
        <p>Your teen's research responses will be treated as confidential. The study will not collect their name, IP addresses, or device identifiers.</p>
        <p>A randomly generated internal participant identifier will be used to associate the required parent/guardian permission and minor consent records with the student's research response. Parent/guardian identifying information, including your email address and electronic signature, will be stored separately from your teen's questionnaire responses and will not be included in the dataset used for research analysis.</p>
        <p>Electronic permission and signature records will be stored in restricted Google Drive storage. A spreadsheet file linking your email address to your teen's study ID will be retained until May 1st 2027 and will then be permanently deleted. Access to individual-level study records will be limited to the Principal Investigators.</p>
        <p>Research findings will be reported in aggregate form. Neither the student nor the parent/guardian will be identified in research reports, presentations, or publications.</p>

        <h3>What happens if I give permission?</h3>
        <ol>
          <li>You will receive a one-time PIN.</li>
          <li>Please provide this PIN directly to your teen.</li>
          <li>Your teen can return to the study website and enter the PIN.</li>
          <li>The system will verify that parent/guardian permission has been obtained before allowing your teen to continue.</li>
          <li>Your teen will then review a student consent form and decide whether they personally wish to participate.</li>
        </ol>
        <p>Participation is entirely voluntary. Your decision about whether to provide permission will not affect your teen's grades, academic standing, access to services, relationship with the institution, or any other benefits to which they are entitled.</p>
        <p>Even if you provide permission, your teen may choose not to participate. If they begin the survey, they may stop at any time without penalty and may skip any question they do not wish to answer.</p>

        <h3>What happens if I do not give permission?</h3>
        <p>You are free to decline permission. If you do not give permission, no PIN will be issued and the student will not be able to proceed to the research survey through this permission request.</p>
        <p>There is no penalty or negative consequence to you or the student for declining permission.</p>

        <h3>Questions About the Study</h3>
        <p>If you have questions about this study, please contact the Principal Investigators:</p>
        <p>
          Joy Lee-Shi, MA<br>
          Faculty of Management &amp; Social Sciences, University of Belize<br>
          <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a>
        </p>
        <p>
          Mathias R. Vairez Jr., PhD<br>
          Department of Education, University of Belize<br>
          <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a>
        </p>
        <p>If you have questions about your teen's rights as a research participant or ethical concerns about this study, you may contact:</p>
        <p>
          Institutional Review Board (IRB)<br>
          The Research Office, University of Belize<br>
          <a href="mailto:researchoffice@ub.edu.bz">researchoffice@ub.edu.bz</a><br>
          (501) 822-1000
        </p>

        <h3>Statement of Parent/Guardian Permission</h3>
        <p>By signing below, I confirm that:</p>
        <ul>
          <li>I am the parent or legal guardian of the student associated with this request.</li>
          <li>I have read and understood the information provided above.</li>
          <li>I have had the opportunity to contact the research team if I have questions or concerns.</li>
          <li>I understand that my teen may decline to participate even if I provide permission.</li>
          <li>I understand that my teen may stop participating at any time without penalty.</li>
          <li>I understand that my teen will encounter some potentially sensitive topics, including stress, mental health, and coping.</li>
          <li>I understand that I will not have access to my teen’s individual survey responses.</li>
        </ul>

        <div class="survey-question">
          <label for="guardian_signature"><strong>Electronic signature</strong></label>
          <p>Please sign below.</p>
          <canvas
            id="guardian_signature"
            class="survey-signature-pad"
            aria-label="Parent or guardian signature pad"
          ></canvas>
          <button
            type="button"
            id="clear-guardian-signature"
            class="btn btn-outline-secondary btn-sm survey-signature-clear"
          >
            Clear signature
          </button>
          <p class="survey-note">
            You may sign using a mouse, trackpad, stylus, or your finger on a touchscreen.
          </p>
        </div>

        <fieldset class="survey-question">
          <legend><strong>Please indicate your decision below.</strong></legend>
          <label>
            <input type="radio" name="permission_decision" value="granted">
            I GIVE permission for the student to participate in this research study.
          </label><br>
          <label>
            <input type="radio" name="permission_decision" value="declined">
            I DO NOT GIVE permission for the student to participate in this research study.
          </label>
        </fieldset>

        <div id="permission-form-error" class="survey-status" aria-live="polite"></div>

        <button
          type="button"
          id="submit-parent-permission"
          class="survey-download-button"
        >
          Submit Permission Decision
        </button>
      </div>
    `;

    setupSignaturePad();
    document
      .getElementById("submit-parent-permission")
      .addEventListener("click", submitPermission);
  }

  function setupSignaturePad() {
    const canvas = document.getElementById("guardian_signature");
    const clearButton = document.getElementById("clear-guardian-signature");
    if (!canvas || !clearButton) return;

    const ctx = canvas.getContext("2d");
    let drawing = false;
    let hasInk = false;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const saved = hasInk ? canvas.toDataURL("image/png") : "";

      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(180 * ratio));
      canvas.style.height = "180px";

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (saved) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, 180);
        img.src = saved;
      }
    }

    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches && event.touches[0];
      const clientX = touch ? touch.clientX : event.clientX;
      const clientY = touch ? touch.clientY : event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function start(event) {
      event.preventDefault();
      drawing = true;
      const p = pointFromEvent(event);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }

    function move(event) {
      if (!drawing) return;
      event.preventDefault();
      const p = pointFromEvent(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasInk = true;
    }

    function stop(event) {
      if (event) event.preventDefault();
      drawing = false;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", stop, { passive: false });

    clearButton.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      state.signatureDataUrl = "";
    });

    canvas.getSignature = () => (hasInk ? canvas.toDataURL("image/png") : "");
  }

  async function submitPermission() {
    if (state.submitted) return;

    const errorEl = document.getElementById("permission-form-error");
    const button = document.getElementById("submit-parent-permission");
    const canvas = document.getElementById("guardian_signature");
    const checked = document.querySelector(
      'input[name="permission_decision"]:checked'
    );

    const signature = canvas && canvas.getSignature
      ? canvas.getSignature()
      : "";

    if (!signature) {
      errorEl.textContent = "Please provide your electronic signature.";
      return;
    }

    if (!checked) {
      errorEl.textContent = "Please select whether you give or do not give permission.";
      return;
    }

    errorEl.textContent = "";
    state.decision = checked.value;
    state.signatureDataUrl = signature;
    state.signedAt = new Date().toISOString();

    setBusy(button, true);

    try {
      const result = await post({
        action: "submit_guardian_permission",
        permission_request_id: state.requestId,
        permission_status: state.decision,
        signature: state.signatureDataUrl,
        signed_at: state.signedAt
      });

      state.submitted = true;
      state.pin = result.pin || "";

      if (state.decision === "granted") {
        renderGrantedConfirmation();
      } else {
        renderDeclinedConfirmation();
      }
    } catch (err) {
      errorEl.textContent =
        "Your permission decision could not be recorded. " + err.message;
      setBusy(button, false);
    }
  }

  function renderGrantedConfirmation() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission Confirmation</h2>
        <h3>✓ Permission Successfully Recorded</h3>
        <p>Thank you. Your permission has been successfully recorded for the study:</p>
        <p><strong>${STUDY_TITLE}</strong></p>

        <h3>One-Time Use PIN</h3>
        <p>Please provide the following PIN directly to your teen:</p>
        <p style="font-size:1.6rem; font-weight:700; letter-spacing:.12em;">
          ${escapeHtml(state.pin)}
        </p>

        <p>Your teen should return to the study website and select <strong>Continue as a Minor</strong>. They will be asked to enter this PIN.</p>
        <p>Once the PIN is successfully verified, the student will be able to review their own consent form. If the student agrees to participate, they may then proceed to the survey.</p>
        <p>This PIN can only be used once. It will remain valid until it is used or until data collection for this study closes.</p>

        <h3>Keep a Copy of Your Permission Form</h3>
        <p>Please keep this document for your records. It contains your parent/guardian permission decision and the participation PIN that must be provided to the student. The document also includes the study information you reviewed.</p>

        <button
          type="button"
          id="download-parent-permission"
          class="survey-download-button"
        >
          Download Signed Permission Form (PDF)
        </button>
      </div>
    `;

    document
      .getElementById("download-parent-permission")
      .addEventListener("click", downloadPermissionPdf);
  }

  function renderDeclinedConfirmation() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission Confirmation</h2>
        <h3>Decision Successfully Recorded</h3>
        <p>Thank you. Your decision <strong>not to give permission</strong> has been recorded.</p>
        <p>No participation PIN has been issued. The student will not be able to proceed to the research survey through this permission request.</p>
        <p>There is no penalty or negative consequence to you or the student for declining permission.</p>

        <button
          type="button"
          id="download-parent-permission"
          class="survey-download-button"
        >
          Download Signed Permission Form (PDF)
        </button>
      </div>
    `;

    document
      .getElementById("download-parent-permission")
      .addEventListener("click", downloadPermissionPdf);
  }

  function permissionPdfText() {
    const decisionText =
      state.decision === "granted"
        ? "I GIVE permission for the student to participate in this research study."
        : "I DO NOT GIVE permission for the student to participate in this research study.";

    return [
      "Parent/Guardian Study Information & Permission Form",
      "",
      `Study Title: ${STUDY_TITLE}`,
      "",
      "Principal Investigators:",
      "Joy Lee-Shi, MA",
      "Faculty of Management & Social Sciences, University of Belize",
      "Email: joy.lee-shi@ub.edu.bz",
      "",
      "Mathias R. Vairez Jr., PhD",
      "Department of Education, University of Belize",
      "Email: mvairez@ub.edu.bz",
      "",
      "Why am I receiving this?",
      "Your teenager expressed interest in participating in this research study and provided your email address so that permission could be requested from a parent or legal guardian. Because your teenager is under 18 years of age, your permission is required before they can participate. Even if you give permission, the student will separately decide whether they wish to participate.",
      "",
      "Purpose of the Study",
      "The purpose of this study is to better understand tertiary-level students' experiences with mental health, coping skills, grit, and perceived stress. The study also aims to evaluate whether the instruments used are appropriate and valid for assessing these experiences among tertiary-level students in Belize.",
      "",
      "What will the student be asked to do?",
      "If permission is given and the student agrees to participate, they will complete an online survey about demographic information, perceived stress, symptoms associated with anxiety and depression, coping strategies, and perseverance or grit. The survey is expected to take approximately 10–20 minutes.",
      "",
      "Risks or discomforts",
      "Some questions address potentially sensitive topics, including stress, symptoms associated with anxiety and depression, mental health history, and coping behaviours. The student may skip questions and may stop participating before submitting the survey without penalty.",
      "",
      "Benefits",
      "There is no guaranteed direct benefit. The findings may contribute to understanding the mental health and well-being of tertiary-level students in Belize and to evaluating commonly used psychological questionnaires in this population.",
      "",
      "Privacy and confidentiality",
      "The student's research responses will be treated as confidential. The study will not collect their name, IP addresses, or device identifiers. Parent/guardian identifying information, including email address and electronic signature, is stored separately from questionnaire responses. A spreadsheet file linking the parent/guardian email address to the student's study ID will be retained until May 1st 2027 and then permanently deleted. Access to individual-level study records is limited to the Principal Investigators.",
      "",
      "Voluntary participation",
      "Providing permission does not require the student to participate. The student may decline, stop participating, or skip questions without penalty.",
      "",
      "Questions About the Study",
      "Joy Lee-Shi, MA — joy.lee-shi@ub.edu.bz",
      "Mathias R. Vairez Jr., PhD — mvairez@ub.edu.bz",
      "",
      "Research participant rights / ethical concerns:",
      "Institutional Review Board (IRB), The Research Office, University of Belize",
      "researchoffice@ub.edu.bz | (501) 822-1000",
      "",
      "Parent/Guardian Permission Decision",
      decisionText,
      "",
      `Signed electronically: ${new Date(state.signedAt).toLocaleString()}`,
      ...(state.pin ? ["", `One-Time Participation PIN: ${state.pin}`] : [])
    ];
  }

  function downloadPermissionPdf() {
    if (
      !window.jspdf ||
      !window.jspdf.jsPDF
    ) {
      alert("The PDF generator did not load. Please try again.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      unit: "pt",
      format: "letter"
    });

    const margin = 54;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const textWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    function addText(text, options = {}) {
      const fontSize = options.fontSize || 10;
      const fontStyle = options.bold ? "bold" : "normal";
      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);

      const lines = doc.splitTextToSize(String(text), textWidth);
      const lineHeight = fontSize * 1.35;
      const required = lines.length * lineHeight + 4;

      if (y + required > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.text(lines, margin, y);
      y += required;
    }

    const lines = permissionPdfText();
    lines.forEach((line, index) => {
      if (index === 0) {
        addText(line, { fontSize: 14, bold: true });
      } else if (
        [
          "Why am I receiving this?",
          "Purpose of the Study",
          "What will the student be asked to do?",
          "Risks or discomforts",
          "Benefits",
          "Privacy and confidentiality",
          "Voluntary participation",
          "Questions About the Study",
          "Parent/Guardian Permission Decision"
        ].includes(line)
      ) {
        y += 5;
        addText(line, { fontSize: 11, bold: true });
      } else if (line === "") {
        y += 5;
      } else {
        addText(line);
      }
    });

    if (state.signatureDataUrl) {
      if (y + 105 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      addText("Electronic Signature", { fontSize: 11, bold: true });
      try {
        doc.addImage(
          state.signatureDataUrl,
          "PNG",
          margin,
          y,
          220,
          80,
          undefined,
          "FAST"
        );
        y += 90;
      } catch (_) {
        addText("[Electronic signature recorded]");
      }
    }

    doc.save(
      state.decision === "granted"
        ? "parent-guardian-permission-signed.pdf"
        : "parent-guardian-permission-declined-signed.pdf"
    );
  }

  validateRequest();
})();
