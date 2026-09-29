(() => {
  const cfg = Object.assign(
    {
      submissionsEnabled: false,
      previewMode: true,
      submissionUrl: "https://script.google.com/macros/s/AKfycbyZhyr22blhlFPBODMvJo8etKpcXy2cUOnXoNMGpNEPVwo6ApYqM__b9qsKjCnlv9Z_/exec",
      permissionRequestUrl: "https://script.google.com/macros/s/AKfycbyZhyr22blhlFPBODMvJo8etKpcXy2cUOnXoNMGpNEPVwo6ApYqM__b9qsKjCnlv9Z_/exec",
      pinVerificationUrl: "https://script.google.com/macros/s/AKfycbyZhyr22blhlFPBODMvJo8etKpcXy2cUOnXoNMGpNEPVwo6ApYqM__b9qsKjCnlv9Z_/exec"
      
    },
    window.MH_SURVEY_CONFIG || {}
  );

  const app = document.getElementById("mh-survey-app");
  const statusEl = document.getElementById("survey-status");

  const newParticipantId = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : `p-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const state = {
    participant_id: newParticipantId(),
    started_at: new Date().toISOString(),
    responses: {},
    currentStep: 0,
    pathway: null, // "adult" or "minor"
    screeningEnrolled: null,
    screeningAge: null,
    participantSignature: null,
    participantSignedAt: null,
    guardianPermissionVerified: false,
    permissionRequestSent: false,
    permissionRequestId: null,
    finished: false
  };


  const scaleOptions = {
    pss: [
      [0, "Never"], [1, "Almost Never"], [2, "Sometimes"], [3, "Fairly Often"], [4, "Very Often"]
    ],
    phq: [
      [0, "Not at all"], [1, "Several days"], [2, "More than half the days"], [3, "Nearly every day"]
    ],
    grit: [
      [5, "Very much like me"], [4, "Mostly like me"], [3, "Somewhat like me"], [2, "Not much like me"], [1, "Not like me at all"]
    ],
    cope: [
      [1, "I haven't been doing this at all"], [2, "A little bit"], [3, "A medium amount"], [4, "I've been doing this a lot"]
    ]
  };

  const demographics = [
    {id: "age", text: "1. What is your age?", type: "number", min: 1, max: 100},
    {id: "gender", text: "2. What is your gender?", type: "radio",
      options: ["Female", "Male", "Transgender female", "Transgender male", "Non-binary", "Prefer to self-describe"]},
    {id: "gender_self_describe", text: "If you selected “Prefer to self-describe,” please specify:", type: "text"},
    { id: "mental_health_diagnosis", text: "3. Have you ever been diagnosed with a mental health condition by a licensed healthcare or mental health professional? Select all that apply.", type: "checkbox", options: ["No", "Anxiety disorder", "Depressive disorder", "Bipolar disorder", "Trauma- or stressor-related disorder (e.g., PTSD)", "Obsessive-compulsive or related disorder", "Eating disorder", "Attention-deficit/hyperactivity disorder (ADHD)", "Substance use disorder", "Other"] },
    { id: "mental_health_diagnosis_other", text: "If Other, please specify:", type: "text" },
    { id: "ethnicity", text: "4. How would you describe your ethnicity? Select one.", type: "radio", options: ["Mestizo", "Hispanic/Latino", "Creole", "Garifuna", "Q'eqchi Maya", "Mopan Maya", "Yucatec Maya", "East Indian", "Mennonite", "Chinese", "Caucasian", "Multi-Ethnic","Prefer to self-describe"] },
    { id: "ethnicity_other", text: "If you selected “Prefer to self-describe,” please specify:", type: "text" },
    { id: "district", text: "5. Where are you based at?", type: "radio", options: ["Corozal", "Orange Walk", "Belize", "Cayes", "Cayo", "Stann Creek", "Toledo"] },
    { id: "area", text: "6. How would you describe your area?", type: "radio", options: ["Rural", "Urban"] },
    { id: "study_level", text: "7. What is your current level of study?", type: "radio", options: ["Certificate", "Associate's degree", "Bachelor's degree", "Master's degree", "PhD"] },
    { id: "enrolment_status", text: "8. What is your current enrolment status?", type: "radio", options: ["Full-time student", "Part-time student", "Other"] },
    { id: "enrolment_status_other", text: "If Other, please specify:", type: "text" },
    { id: "institution", text: "9. At which institution are you currently enrolled?", type: "radio", options: 
      ["Belize Adventist Junior College", "Centro Escolar Mexico Junior College", 
        "Corozal Junior College", "Stann Creek Ecumenical Junior College", "Galen University",
        "Independence Junior College", "John Paul The Great College", "Muffles Junior College",
        "Sacred Heart Junior College", "San Pedro Junior College", "St John's College Junior College",
        "St John's College University Division", "University of Belize - Belize City Campus", 
        "University of Belize - Belmopan Campus", "University of Belize - Punta Gorda Campus", 
        "UWI Global Campus Belize", "Wesley Junior CCollege", "Other"] },
    { id: "institution_other", text: "If Other, please specify:", type: "text" },
    { id: "area_of_study", text: "10. What is your main area of study?", type: "radio", options: ["Arts and Humanities", "Business and Management", "Education", "Health Sciences", "Science, Technology, Engineering, and Mathematics", "Social and Behavioural Sciences", "Technical or Vocational Studies", "Other"] },
    { id: "area_of_study_other", text: "If Other, please specify:", type: "text" },
    { id: "employment", text: "11. Are you currently employed while attending school?", type: "radio", options: ["No", "Yes, part-time", "Yes, full-time"] },
    { id: "financial_situation", text: "12. How would you describe your current household or family financial situation?", type: "radio", options: ["Very difficult to meet basic expenses", "Somewhat difficult to meet basic expenses", "Able to meet basic expenses, but with little money left over", "Comfortable, with some money available beyond basic expenses", "Very comfortable financially"] }
  ];

  const pssItems = [
    "In the last month, how often have you been upset because of something that happened unexpectedly?",
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt nervous and “stressed”?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    "In the last month, how often have you been able to control irritations in your life?",
    "In the last month, how often have you felt that you were on top of things?",
    "In the last month, how often have you been angered because of things that were outside of your control?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
  ];

  const phqItems = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless"
  ];

  const gritItems = [
    "New ideas and projects sometimes distract me from previous ones.",
    "Setbacks discourage me.",
    "I have been obsessed with a certain idea or project for a short time but later lost interest.",
    "I am a hard worker.",
    "I often set a goal but later choose to pursue a different one.",
    "I have difficulty maintaining my focus on projects that take more than a few months to complete.",
    "I finish whatever I begin.",
    "I am diligent."
  ];

  const copeItems = [
    "I've been turning to work or other activities to take my mind off things.",
    "I've been concentrating my efforts on doing something about the situation I'm in.",
    "I've been saying to myself \"this isn't real.\".",
    "I've been using alcohol or other drugs to make myself feel better.",
    "I've been getting emotional support from others.",
    "I've been giving up trying to deal with it.",
    "I've been taking action to try to make the situation better.",
    "I've been refusing to believe that it has happened.",
    "I've been saying things to let my unpleasant feelings escape.",
    "I've been getting help and advice from other people.",
    "I've been using alcohol or other drugs to help me get through it.",
    "I've been trying to see it in a different light, to make it seem more positive.",
    "I've been criticizing myself.",
    "I've been trying to come up with a strategy about what to do.",
    "I've been getting comfort and understanding from someone.",
    "I've been giving up the attempt to cope.",
    "I've been looking for something good in what is happening.",
    "I've been making jokes about it.",
    "I've been doing something to think about it less, such as going to movies, watching TV, reading, daydreaming, sleeping, or shopping.",
    "I've been accepting the reality of the fact that it has happened.",
    "I've been expressing my negative feelings.",
    "I've been trying to find comfort in my religion or spiritual beliefs.",
    "I've been trying to get advice or help from other people about what to do.",
    "I've been learning to live with it.",
    "I've been thinking hard about what steps to take.",
    "I've been blaming myself for things that happened.",
    "I've been praying or meditating.",
    "I've been making fun of the situation."
  ];

  const briefCopeScales = [
    { key: "self_distraction", label: "Self-distraction", items: [1, 19] },
    { key: "active_coping", label: "Active coping", items: [2, 7] },
    { key: "denial", label: "Denial", items: [3, 8] },
    { key: "substance_use", label: "Substance use", items: [4, 11] },
    { key: "emotional_support", label: "Emotional support", items: [5, 15] },
    { key: "instrumental_support", label: "Instrumental support", items: [10, 23] },
    { key: "behavioral_disengagement", label: "Behavioural disengagement", items: [6, 16] },
    { key: "venting", label: "Venting", items: [9, 21] },
    { key: "positive_reframing", label: "Positive reframing", items: [12, 17] },
    { key: "planning", label: "Planning", items: [14, 25] },
    { key: "humor", label: "Humour", items: [18, 28] },
    { key: "acceptance", label: "Acceptance", items: [20, 24] },
    { key: "religion", label: "Religion", items: [22, 27] },
    { key: "self_blame", label: "Self-blame", items: [13, 26] }
  ];

  const STUDY_TITLE = "Mental Health, Coping, Grit, and Perceived Stress Among Tertiary-Level Students in Belize";

  const consentHtml = `
    <h2>${state.pathway === "minor" ? "Minor Assent Form" : "Consent Form"}</h2>
    <p><strong>Study Title:</strong> ${STUDY_TITLE}</p>
    <p><strong>Principal Investigators:</strong><br>
    Joy Lee-Shi, MA<br>Faculty of Management &amp; Social Sciences, University of Belize<br>
    Email: <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
    <p>Mathias R. Vairez Jr., PhD<br>Department of Education, University of Belize<br>
    Email: <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a></p>

    <h3>Purpose of the Study</h3>
    <p>You are invited to participate in a research study about student mental health and well-being. The purpose of this study is to better understand <strong>tertiary level students'</strong> experiences with mental health, coping skills, grit, and perceived stress. This study also aims to evaluate whether the instruments used are appropriate and valid for assessing these experiences among tertiary-level students in Belize.</p>

    <h3>What You Will Be Asked to Do</h3>
    <p>If you agree to participate, you will be asked to complete a survey containing questions about your demographic details, experiences with stress, coping strategies, perseverance or grit, and mental health.</p>
    <p>The survey is expected to take about <strong>10 to 20 minutes</strong> to complete.</p>

    <h3>Risks or Discomforts</h3>
    <p>Some questions may ask about personal experiences related to stress or mental health. You may feel uncomfortable, upset, or emotional when answering some questions.</p>
    <p>You may skip any question you do not wish to answer, and you may stop participating at any time without penalty.</p>

    <h3>Potential Benefits</h3>
    <p>After completing the survey, you will receive a debriefing form with brief educational information about the questionnaires used in the study and links where you may learn more about them. The debriefing will also provide mental health and support resources in Belize. These resources are provided to all participants and are not based on or triggered by individual questionnaire responses.</p>
    <p>Your participation may also contribute to a better understanding of student mental health and well-being and may help inform future programs or resources designed to support students. Your participation may also help researchers determine whether the scales used in this study are suitable and valid for tertiary-level students in Belize.</p>

    <h3>Confidentiality</h3>
    <p>The survey is confidential, so your name and other directly identifying information will not be collected. Survey responses will be transmitted to a secure Google-based data system and stored in private Google Sheets within a Google Drive folder controlled by the Principal Investigators. Access to this folder will be restricted to the Principal Investigators. The research dataset will not record your name, IP address, or device identifier.</p>
    <p>An electronic signature will be collected to document your ${state.pathway === "minor" ? "assent" : "consent"} to participate. ${state.pathway === "minor" ? "Your parent or legal guardian must also have provided permission before you can access this form. " : ""}Signatures will be stored separately from your survey responses and will not be included in the research dataset used for analysis.</p>
    <p>We advise against using an employer-issued device to complete this study, as we cannot guarantee the confidentiality of your data regarding the interception of data sent via Internet by third parties (such as your employer).</p>
    <p>If you choose to provide an email address, it will be stored in a separate private file from your survey responses. A randomly generated participant ID will be used to link your email address to your survey response only for the purpose of locating and removing your data if you later request withdrawal. Your email address will not be included in the research dataset used for analysis and will not appear in reports, presentations, or publications.</p>
    <p>The separate file linking optional email addresses to participant IDs will be retained until <strong>May 1, 2027</strong> and will then be permanently deleted. Requests to withdraw already-submitted data can only be accommodated up to this date. After the linkage file is deleted, it will no longer be possible to identify and remove an individual participant's response.</p>
    <p>De-identified survey data will be retained for at least five years after completion of the study and may be retained beyond that period for future related research.</p>
    <p>Results will be reported in a way that does not identify individual participants. Findings will be presented as overall patterns and summaries rather than as individual responses.</p>

    <h3>Voluntary Participation</h3>
    <p>Your participation in this study is completely voluntary. You may choose not to participate or may stop participating at any time without penalty. Your decision will not affect your grades, academic standing, relationship with your school, or access to services.</p>
    <p>If you wish to withdraw while completing the survey, you may simply exit the survey at any time. If you decide to withdraw after submitting your responses, you may contact the Principal Investigators to request that your data be removed, provided that your responses can still be identified and linked to you.</p>
    <p>There is no financial compensation for participating in this study.</p>

    <h3>Questions About the Study</h3>
    <p>Joy Lee-Shi, MA<br>Faculty of Management &amp; Social Sciences, University of Belize<br>
    <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
    <p>Mathias R. Vairez Jr., PhD<br>Department of Education, University of Belize<br>
    <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a></p>
    <p>For questions about your rights as a research participant:</p>
    <p>Institutional Review Board (IRB)<br>The Research Office, University of Belize<br>
    <a href="mailto:researchoffice@ub.edu.bz">researchoffice@ub.edu.bz</a><br>(501) 822-1000</p>

    <h3>${state.pathway === "minor" ? "Assent to Participate" : "Consent to Participate"}</h3>
    <p>By signing below and clicking “NEXT” to proceed with the survey, you confirm that:</p>
    <ul>
      <li>You have read and understood the information provided above.</li>
      <li>You have had the opportunity to ask questions about the study.</li>
      <li>You understand that participation is voluntary.</li>
      <li>You understand that you may skip questions or stop participating at any time.</li>
      <li>You voluntarily agree to participate in this research study.</li>
    </ul>

    <div class="survey-question">
      <label for="participant_signature"><strong>Electronic signature</strong></label>
      <p>Please sign below to indicate your ${state.pathway === "minor" ? "assent" : "consent"} to participate.</p>
      <canvas id="participant_signature" class="survey-signature-pad" aria-label="Participant signature pad"></canvas>
      <button type="button" class="btn btn-outline-secondary btn-sm survey-signature-clear" data-clear-signature="participant_signature">Clear signature</button>
      <p class="survey-note">You may sign using a mouse, trackpad, stylus, or your finger on a touchscreen.</p>
    </div>
    <p>If you do not agree to participate, please close the current browser tab.</p>
  `;

  const steps = [
    { id: "optional_contact", title: "Optional Contact", render: renderOptionalContact },
    { id: "demographics", title: "Demographics", render: () => renderQuestions("Demographic Information", demographics) },
    { id: "pss", title: "Perceived Stress", render: () => renderScale("PSS-10", "The questions in this scale ask you about your feelings and thoughts during <strong>the last month.</strong> In each case, indicate how often you felt or thought a certain way.", pssItems, scaleOptions.pss, "pss") },
    { id: "phq", title: "Mental Health", render: () => renderScale("PHQ-4", "Over the last two weeks, how often have you been bothered by the following problems?", phqItems, scaleOptions.phq, "phq") },
    { id: "grit", title: "Grit", render: () => renderScale("Grit-S", "Please answer based on your experiences, not how you would like to be. There are no right or wrong answers.", gritItems, scaleOptions.grit, "grit") },
    { id: "cope", title: "Coping", render: () => renderScale("Brief COPE", "These items deal with ways you've been coping with the stress in your life. Read the statements and indicate how much you have been using each coping style.", copeItems, scaleOptions.cope, "cope") },
    { id: "submit", title: "Submit", render: renderSubmit }
  ];

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[ch]));
  }

  function radio(name, value, label, checked = false) {
    return `<label class="survey-option"><input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}> <span>${label}</span></label>`;
  }

  function checkbox(name, value, label, checked = false) {
    return `<label class="survey-option"><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}> <span>${label}</span></label>`;
  }

  function renderPathwaySelection() {
    app.innerHTML = `
      ${cfg.previewMode ? `<div class="survey-banner warning">Preview mode: submissions are disabled.</div>` : ""}
      <div class="survey-card">
        <p>Thank you for your interest in this University of Belize research study.</p>
        <p><strong>Please select the option that applies to you:</strong></p>

        <div class="survey-question">
          <h4>I am starting the survey</h4>
          <p>Choose this option if you are visiting the study for the first time. You will first receive information about the study and answer two brief questions to determine whether you are eligible to participate.</p>
          <button class="survey-download-button" type="button" data-action="start-survey">START SURVEY</button>
        </div>

        <div class="survey-question">
          <h4>I am under 18 and have received a PIN</h4>
          <p>Choose this option if your parent or legal guardian has already completed the Parent/Guardian Permission Form and given you a participation PIN.</p>
          <button class="survey-download-button" type="button" data-action="continue-with-pin">CONTINUE WITH PIN</button>
        </div>
      </div>
    `;
    bindEntryActions();
  }

  function renderEligibility() {
    app.innerHTML = `
      <div class="survey-card">
        <p><strong>Study Title:</strong> ${STUDY_TITLE}</p>
        <h3>Purpose of the Study</h3>
        <p>You are invited to participate in a research study about student mental health and well-being. The purpose of this study is to better understand tertiary level students' experiences with mental health, coping skills, grit, and perceived stress. This study also aims to evaluate whether the instruments used are appropriate and valid for assessing these experiences among tertiary-level students in Belize.</p>
        <h3>Eligibility Screening</h3>
        <p>Before continuing, please answer the following questions to determine whether you are eligible to participate in this study.</p>
        <fieldset class="survey-question">
          <legend>1. Are you currently enrolled at a tertiary-level institution in Belize?</legend>
          <div class="survey-options">
            ${radio("screening_enrolled", "Yes", "Yes", state.screeningEnrolled === "Yes")}
            ${radio("screening_enrolled", "No", "No", state.screeningEnrolled === "No")}
          </div>
        </fieldset>
        <div class="survey-question">
          <label for="screening_age">2. What is your age?</label>
          <input class="survey-number" id="screening_age" name="screening_age" type="number" min="1" max="120" inputmode="numeric" value="${escapeHtml(state.screeningAge ?? "")}"> <span>years</span>
        </div>
      </div>
      <div class="survey-actions">
        <button class="survey-nav-button survey-nav-back" type="button" data-action="entry-back">BACK</button>
        <button class="survey-nav-button survey-nav-next" type="button" data-action="eligibility-next">NEXT</button>
      </div>
    `;
    bindEntryActions();
  }

  function renderPermissionRequired() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission Required</h2>
        <p>Because you are under 18, permission from a parent or legal guardian is required before you can participate in this study.</p>
        <p>Please provide your parent or legal guardian's email address. We will use this contact information only to send them information about the study and request their permission for you to participate.</p>
        <div class="survey-question">
          <label for="guardian_email"><strong>Parent/Guardian email address</strong></label>
          <input class="survey-text" id="guardian_email" name="guardian_email" type="email" autocomplete="email" inputmode="email" placeholder="name@example.com">
        </div>
        <p>Your parent/guardian will receive a link to a separate permission form. If they give permission, they will receive a one-time PIN to provide to you. You will need this PIN before you can participate in the study.</p>
        <p>You do not need to wait on this page. You may close the study website and return after your parent or guardian has completed the permission form.</p>
      </div>
      <div class="survey-actions">
        <button class="survey-nav-button survey-nav-back" type="button" data-action="permission-back">BACK</button>
        <button class="survey-nav-button survey-nav-next" type="button" data-action="request-permission">SUBMIT</button>
      </div>
    `;
    bindEntryActions();
  }

  function renderPermissionRequestConfirmation() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission Request Sent</h2>
        <p>The permission request has been sent to the parent or legal guardian email address you provided.</p>
        <p>You may close this page now. After your parent or guardian completes the permission form and gives you the PIN, return to the study website and select <strong>“I am under 18 and have received a PIN.”</strong></p>
        <button class="btn btn-primary" type="button" data-action="return-home">RETURN TO STUDY HOME</button>
      </div>
    `;
    bindEntryActions();
  }

  function renderPinVerification() {
    app.innerHTML = `
      <div class="survey-card">
        <h2>Parent/Guardian Permission Verification</h2>
        <p>Because you are under 18 years old, permission from a parent or legal guardian is required before you can participate in this study.</p>
        <p>If your parent or legal guardian has completed the Parent/Guardian Permission Form, they will have received a one-time-use PIN to give to you.</p>
        <div class="survey-question">
          <label for="permission_pin"><strong>Parent/Guardian Permission PIN:</strong></label>
          <input class="survey-text" id="permission_pin" name="permission_pin" type="text" inputmode="text" autocomplete="one-time-code" maxlength="20">
        </div>
        <button class="btn btn-primary" type="button" data-action="verify-pin">VERIFY PIN</button>
        <div id="pin-result" class="mt-3"></div>
      </div>
      <div class="survey-actions">
        <button class="survey-nav-button survey-nav-back" type="button" data-action="entry-back">BACK</button>
        <button class="survey-nav-button survey-nav-next" type="button" data-action="pin-next" ${state.guardianPermissionVerified ? "" : "disabled"}>NEXT</button>
      </div>
    `;
    bindEntryActions();
  }

  function renderConsent() {
    app.innerHTML = `
      ${cfg.previewMode ? `<div class="survey-banner warning">Preview mode: submissions are disabled.</div>` : ""}
      <div class="survey-card">${consentHtml}</div>
      <div class="survey-actions">
        <button class="survey-nav-button survey-nav-back" type="button" data-action="consent-back">BACK</button>
        <button class="survey-nav-button survey-nav-next" type="button" data-action="consent-next">NEXT</button>
      </div>
    `;
    setupSignaturePad("participant_signature", "participantSignature", "participantSignedAt");
    bindEntryActions();
  }

  function renderQuestion(q) {
    const current = state.responses[q.id];
    if (q.type === "text") {
      return `<div class="survey-question"><label for="${q.id}">${q.text}</label><input class="survey-text" id="${q.id}" name="${q.id}" type="text" value="${escapeHtml(current || "")}"></div>`;
    }
    if (q.type === "number") {
      return `<div class="survey-question"><label for="${q.id}">${q.text}</label><input class="survey-number" id="${q.id}" name="${q.id}" type="number" min="${q.min}" max="${q.max}" inputmode="numeric" value="${escapeHtml(current ?? "")}"></div>`;
    }
    if (q.type === "radio") {
      return `<fieldset class="survey-question"><legend>${q.text}</legend><div class="survey-options">${q.options.map(o => radio(q.id, o, escapeHtml(o), current === o)).join("")}</div></fieldset>`;
    }
    if (q.type === "checkbox") {
      const vals = Array.isArray(current) ? current : [];
      return `<fieldset class="survey-question"><legend>${q.text}</legend><div class="survey-options">${q.options.map(o => checkbox(q.id, o, escapeHtml(o), vals.includes(o))).join("")}</div></fieldset>`;
    }
    return "";
  }

  function renderQuestions(title, questions) {
    return `<h2>${title}</h2>${questions.map(renderQuestion).join("")}`;
  }

  function renderScale(title, intro, items, options, prefix) {
    return `
      <h2>${title}</h2>
      <p>${intro}</p>
      ${items.map((item, i) => {
        const key = `${prefix}${i + 1}`;
        const current = state.responses[key];
        return `<fieldset class="survey-question"><legend>${i + 1}. ${escapeHtml(item)}</legend><div class="survey-options">${options.map(([v, label]) => radio(key, String(v), escapeHtml(label), String(current) === String(v))).join("")}</div></fieldset>`;
      }).join("")}
    `;
  }

  function renderOptionalContact() {
    const email = state.responses.withdrawal_email || "";
    return `
      <h2>Optional Contact Information</h2>
      <p>You may provide an email address if you would like the Principal Investigators to be able to locate your survey response if you later request to withdraw your data. Providing an email address is <strong>optional</strong>.</p>
      <p>Your email address will be stored separately from your survey responses and linked only through your random participant ID. It will be used only for withdrawal-related purposes and will not be included in the research dataset used for analysis.</p>
      <div class="survey-question">
        <label for="withdrawal_email">Email address (optional)</label>
        <input class="survey-text" id="withdrawal_email" name="withdrawal_email" type="email" autocomplete="email" inputmode="email" value="${escapeHtml(email)}" placeholder="name@example.com">
      </div>
    `;
  }

  function renderSubmit() {
    return `
      <h2>Submit Survey</h2>
      <p>You may review previous sections using the Back button to check if you have skipped any questions.</p>
      ${cfg.submissionsEnabled && cfg.submissionUrl ? "" : `<div class="survey-banner warning">Data collection is currently disabled. This is an ethics-review/testing build and will not send responses anywhere.</div>`}
    `;
  }

  function renderSurvey() {
    if (state.finished) return;
    clearStatus();
    const step = steps[state.currentStep];
    const pct = Math.round(((state.currentStep + 1) / steps.length) * 100);
    const nextLabel = step.id === "submit" ? (cfg.submissionsEnabled ? "SUBMIT SURVEY" : "VIEW DEBRIEFING") : "NEXT";

    app.innerHTML = `
      ${cfg.previewMode ? `<div class="survey-banner warning">Preview mode: submissions are disabled.</div>` : ""}
      <div class="survey-progress-wrap">
        <div class="survey-progress-label"><span>${escapeHtml(step.title)}</span><span>${state.currentStep + 1} of ${steps.length}</span></div>
        <div class="survey-progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="survey-card">${step.render()}</div>
      <div class="survey-actions">
        ${state.currentStep > 0 ? `<button class="survey-nav-button survey-nav-back" type="button" data-action="survey-back">BACK</button>` : `<span></span>`}
        <button class="survey-nav-button survey-nav-next" type="button" data-action="survey-next">${nextLabel}</button>
      </div>
    `;
    bindSurveyActions();
  }

  function collectSurveyInputs() {
    app.querySelectorAll("input").forEach(input => {
      const name = input.name;
      if (!name) return;
      if (input.type === "radio") {
        if (input.checked) state.responses[name] = input.value;
      } else if (input.type === "checkbox") {
        const group = Array.from(app.querySelectorAll(`input[type=checkbox][name="${CSS.escape(name)}"]`));
        state.responses[name] = group.filter(x => x.checked).map(x => x.value);
      } else {
        state.responses[name] = input.value;
      }
    });
  }

  function setupSignaturePad(canvasId, signatureStateKey, signedAtStateKey) {
    const canvas = app.querySelector(`#${canvasId}`);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const height = 180;
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const width = canvas.getBoundingClientRect().width;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#222";
      if (state[signatureStateKey]) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        img.src = state[signatureStateKey];
      }
    };
    resizeCanvas();

    let drawing = false;
    const pointFromEvent = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    canvas.addEventListener("pointerdown", event => {
      event.preventDefault();
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const point = pointFromEvent(event);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      clearStatus();
    });

    canvas.addEventListener("pointermove", event => {
      if (!drawing) return;
      event.preventDefault();
      const point = pointFromEvent(event);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });

    const finishSignature = event => {
      if (!drawing) return;
      drawing = false;
      if (event && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      state[signatureStateKey] = canvas.toDataURL("image/png");
      state[signedAtStateKey] = new Date().toISOString();
    };
    canvas.addEventListener("pointerup", finishSignature);
    canvas.addEventListener("pointercancel", finishSignature);

    const clearButton = app.querySelector(`[data-clear-signature="${canvasId}"]`);
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        state[signatureStateKey] = null;
        state[signedAtStateKey] = null;
        clearStatus();
      });
    }
  }

  function bindEntryActions() {
    app.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", clearStatus);
      input.addEventListener("change", clearStatus);
    });

    app.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const action = btn.dataset.action;

        if (action === "start-survey") return renderEligibility();
        if (action === "continue-with-pin") {
          state.pathway = "minor";
          state.guardianPermissionVerified = false;
          return renderPinVerification();
        }
        if (action === "entry-back" || action === "return-home") return renderPathwaySelection();

        if (action === "eligibility-next") {
          const enrolled = app.querySelector('input[name="screening_enrolled"]:checked')?.value;
          const age = Number(app.querySelector("#screening_age")?.value);
          if (!enrolled || !Number.isFinite(age) || age <= 0) {
            return setStatus("Please answer the enrolment and age questions so the survey can determine eligibility.", true);
          }
          state.screeningEnrolled = enrolled;
          state.screeningAge = age;

          if (enrolled !== "Yes") {
            return renderEnded("Thank you for your interest in this study. This research is currently open only to students enrolled at a tertiary-level institution in Belize. ");
          }

          if (age >= 18) {
            state.pathway = "adult";
            return renderConsent();
          }

          state.pathway = "minor";
          return renderPermissionRequired();
        }

        if (action === "permission-back") return renderEligibility();

        if (action === "request-permission") {
          const emailInput = app.querySelector("#guardian_email");
          const email = emailInput?.value.trim();
          if (!email || !emailInput.checkValidity()) {
            return setStatus("Please enter a valid parent or legal guardian email address.", true);
          }
          await requestGuardianPermission(email, btn);
          return;
        }

        if (action === "verify-pin") {
          const pin = app.querySelector("#permission_pin")?.value.trim();
          if (!pin) return setStatus("Please enter the PIN provided by your parent or legal guardian.", true);
          await verifyPermissionPin(pin, btn);
          return;
        }

        if (action === "pin-next") {
          if (!state.guardianPermissionVerified) {
            return setStatus("Parent/guardian permission must be verified before you can continue.", true);
          }
          return renderConsent();
        }

        if (action === "consent-back") {
          state.participantSignature = null;
          state.participantSignedAt = null;
          return state.pathway === "minor" ? renderPinVerification() : renderEligibility();
        }

        if (action === "consent-next") {
          if (!state.participantSignature) {
            return setStatus(`Please provide your signature to indicate your ${state.pathway === "minor" ? "assent" : "consent"} before continuing.`, true);
          }
          state.currentStep = 0;
          return renderSurvey();
        }
      });
    });
  }

  function bindSurveyActions() {
    app.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", clearStatus);
      input.addEventListener("change", clearStatus);
    });

    app.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        collectSurveyInputs();
        const action = btn.dataset.action;
        if (action === "survey-back") {
          state.currentStep = Math.max(0, state.currentStep - 1);
          renderSurvey();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (action !== "survey-next") return;

        const step = steps[state.currentStep];

        if (step.id === "optional_contact") {
          const emailInput = app.querySelector("#withdrawal_email");
          if (emailInput && emailInput.value && !emailInput.checkValidity()) {
            return setStatus("Please enter a valid email address or leave the email field blank.", true);
          }
        }

        if (step.id === "demographics") {
          const demographicAge = Number(state.responses.age);
          if (state.responses.age && (!Number.isFinite(demographicAge) || demographicAge <= 0)) {
            return setStatus("Please enter a valid age or leave the item blank.", true);
          }
        }

        if (step.id === "submit") return finishSurvey();

        state.currentStep += 1;
        renderSurvey();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  async function requestGuardianPermission(email, button) {
    if (!cfg.permissionRequestUrl) {
      if (cfg.previewMode) {
        state.permissionRequestSent = true;
        return renderPermissionRequestConfirmation();
      }
      return setStatus("The parent/guardian permission service has not yet been configured.", true);
    }

    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Sending...";
    try {
      const response = await fetch(cfg.permissionRequestUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          action: "request_guardian_permission",
          participant_id: state.participant_id,
          guardian_email: email
        })
      });
      const result = await response.json();
      if (!result || result.ok !== true) throw new Error(result?.message || "Permission request failed.");
      state.permissionRequestSent = true;
      state.permissionRequestId = result.permission_request_id || null;
      renderPermissionRequestConfirmation();
    } catch (error) {
      console.error(error);
      setStatus("The permission request could not be sent. Please check the email address and try again.", true);
      button.disabled = false;
      button.textContent = original;
    }
  }

  async function verifyPermissionPin(pin, button) {
    const resultEl = app.querySelector("#pin-result");
    const nextButton = app.querySelector('[data-action="pin-next"]');

    if (!cfg.pinVerificationUrl) {
      if (resultEl) resultEl.innerHTML = `<div class="survey-banner warning"><strong>PIN verification is not currently available.</strong></div>`;
      return;
    }

    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Verifying...";
    try {
      const response = await fetch(cfg.pinVerificationUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ action: "verify_permission_pin", pin })
      });
      const result = await response.json();

      if (result && result.ok === true && result.verified === true) {
        state.guardianPermissionVerified = true;
        if (result.participant_id) state.participant_id = result.participant_id;
        if (result.permission_request_id) state.permissionRequestId = result.permission_request_id;
        if (result.verification_token) state.permissionVerificationToken = result.verification_token;

        if (resultEl) {
          resultEl.innerHTML = `
            <div class="survey-banner">
              <h3>✅ Parent/guardian permission confirmed</h3>
              <p>Your parent or legal guardian’s permission has been successfully verified. This does not mean that you have to participate.</p>
              <p>Please click next and read the information carefully before deciding whether you would like to participate.</p>
            </div>`;
        }
        if (nextButton) nextButton.disabled = false;
      } else {
        state.guardianPermissionVerified = false;
        if (resultEl) {
          resultEl.innerHTML = `
            <div class="survey-banner warning">
              <h3>❌ Permission PIN Not Verified</h3>
              <p>We could not verify the PIN you entered.</p>
              <p>Please check that the PIN was entered exactly as provided by your parent or legal guardian and try again.</p>
            </div>`;
        }
        if (nextButton) nextButton.disabled = true;
      }
    } catch (error) {
      console.error(error);
      setStatus("The PIN could not be verified at this time. Please try again.", true);
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  async function finishSurvey() {
    const submitButton = app.querySelector('[data-action="survey-next"]');
    const backButton = app.querySelector('[data-action="survey-back"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
      submitButton.setAttribute("aria-busy", "true");
    }
    if (backButton) backButton.disabled = true;

    setStatus("Please wait while your responses are securely submitted.", false);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const submittedAt = new Date().toISOString();
    const { withdrawal_email: withdrawalEmail, ...surveyResponses } = state.responses;

    const payload = {
      participant_id: state.participant_id,
      started_at: state.started_at,
      submitted_at: submittedAt,
      participant_pathway: state.pathway,
      responses: surveyResponses,
      contact: withdrawalEmail ? {
        participant_id: state.participant_id,
        email: withdrawalEmail,
        submitted_at: submittedAt
      } : null,
      consent_assent: {
        participant_id: state.participant_id,
        type: state.pathway === "minor" ? "minor_assent" : "adult_consent",
        signature: state.participantSignature,
        signed_at: state.participantSignedAt
      },
      guardian_permission_verification: state.pathway === "minor" ? {
        verified: state.guardianPermissionVerified,
        permission_request_id: state.permissionRequestId || null,
        verification_token: state.permissionVerificationToken || null
      } : null
    };

    // screeningEnrolled and screeningAge are intentionally NOT included in the research payload.
    if (cfg.submissionsEnabled && cfg.submissionUrl) {
      try {
        await fetch(cfg.submissionUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload)
        });
        setStatus("Your response was submitted.", false);
      } catch (error) {
        console.error(error);
        setStatus("The survey could not confirm submission. Please do not resubmit until the study team checks the data system.", true);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "SUBMIT SURVEY";
          submitButton.removeAttribute("aria-busy");
        }
        if (backButton) backButton.disabled = false;
        return;
      }
    }

    state.finished = true;
    app.innerHTML = renderDebrief();
    setupDebriefPdf();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderDebrief() {
    return `
      <div class="survey-card">
        <h2>Debriefing Form</h2>
        <p><strong>Study Title:</strong> ${STUDY_TITLE}</p>
        <p>The purpose of this research is to better understand tertiary-level students’ experiences with mental health, coping skills, grit, and perceived stress. The study also aims to examine whether the questionnaires used are reliable and appropriate for use with tertiary-level students.</p>

        <h3>About the questionnaires</h3>
        <p><strong>Perceived Stress Scale (PSS-10):</strong> asks about how stressful, unpredictable, or overwhelming you have found situations in your life recently. <a href="https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales/index.html" target="_blank" rel="noopener noreferrer">Find out more</a>.</p>
        <p><strong>Patient Health Questionnaire-4 (PHQ-4):</strong> asks about symptoms related to anxiety and depression. It is a brief screening tool and does not provide a clinical diagnosis. <a href="https://www.phqscreeners.com/" target="_blank" rel="noopener noreferrer">Find out more</a>.</p>
        <p><strong>Short Grit Scale (Grit-S):</strong> assesses perseverance of effort and consistency of interest toward long-term goals. <a href="https://angeladuckworth.com/grit-scale/" target="_blank" rel="noopener noreferrer">Find out more</a>.</p>
        <p><strong>Brief COPE:</strong> explores 14 coping strategies: active coping, planning, positive reframing, acceptance, emotional support, instrumental support, self-distraction, venting, denial, behavioural disengagement, self-blame, humour, religion, and substance use. <a href="https://local.psy.miami.edu/faculty/ccarver/sclBrCOPE.phtml" target="_blank" rel="noopener noreferrer">Find out more</a>.</p>

        <h3>Emotional Well-being and Support</h3>
        <p>In this study, we asked about your experiences relating to mental health, coping, grit, and perceived stress, which may have brought up strong emotions. We encourage you to reach out to a friend, family member, or a mental health professional if you feel distressed.</p>
        <p>Online Directory of Mental Health Professionals in Belize: <a href="https://www.mindhealthconnect.com/professionals-in-the-field/" target="_blank" rel="noopener noreferrer">Mind Health Connect</a></p>
        <p>Free or affordable mental health support can also be found at the Community Counseling Center branches:</p>
        <ul>
          <li>Belize District: Lake Independence Blvd (Chetumal St.). Phone: 227-1406 / 227-4003</li>
          <li>Corozal District. Phone: 402-2120</li>
          <li>Cayo District. Phone: 804-2098</li>
          <li>Orange Walk District: Betias Lane. Phone: 302-2058</li>
          <li>Stann Creek District: 8 Pen Road. Phone: 502-0038</li>
          <li>Toledo District. Phone: 702-2021</li>
        </ul>
        <p>If you believe you are in immediate danger or may harm yourself or someone else, please contact your local emergency services or go to the nearest emergency department.</p>

        <h3>Confidentiality and Privacy</h3>
        <p>Your research data will be kept confidential. Survey responses are stored separately from optional email contact information and linked only by a randomly generated participant ID. Access to the research files will be restricted to the Principal Investigators. When findings are shared, they will be presented as general patterns and summaries across participants. Identifying information will not be included in presentations, reports, or publications.</p>

        <h3>Questions About the Study</h3>
        <p>If you have questions about this study, or if you would like to receive a copy of this study’s findings, please contact the Principal Investigators:</p>
        <p>Joy Lee-Shi, MA<br>Faculty of Management &amp; Social Sciences, University of Belize<br><a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
        <p>Mathias R. Vairez Jr., PhD<br>Department of Education, University of Belize<br><a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a></p>
        <p>You may also contact the Principal Investigators to request that your data be removed.</p>
        <p>For questions about your rights as a research participant, or any complaints you may have, you may contact:</p>
        <p>Institutional Review Board (IRB)<br>The Research Office, University of Belize<br><a href="mailto:researchoffice@ub.edu.bz">researchoffice@ub.edu.bz</a><br>(501) 822-1000</p>

        <div class="text-center my-4">
          <button type="button" class="survey-download-button" id="download-debrief-pdf">Download this Debriefing Form (PDF)</button>
        </div>

        <p><strong>Thank you for your participation and for contributing to research on student mental health and well-being.</strong></p>
      </div>
    `;
  }

  function setupDebriefPdf() {
    const pdfButton = app.querySelector("#download-debrief-pdf");
    if (!pdfButton) return;
    pdfButton.addEventListener("click", async () => {
      const debrief = app.querySelector(".survey-card");
      const originalText = pdfButton.textContent;
      pdfButton.disabled = true;
      pdfButton.textContent = "Preparing PDF...";
      try {
        await html2pdf().set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: "student-mental-health-debriefing-form.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] }
        }).from(debrief).save();
      } catch (error) {
        console.error("PDF generation failed:", error);
        setStatus("The PDF could not be created. Please try again.", true);
      } finally {
        pdfButton.disabled = false;
        pdfButton.textContent = originalText;
      }
    });
  }

  function renderEnded(message) {
    state.finished = true;
    app.innerHTML = `<div class="survey-card survey-ineligible"><h2>Survey Ended</h2><p>${escapeHtml(message)}</p></div>`;
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.style.fontWeight = "";
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.fontWeight = isError ? "650" : "400";
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  renderPathwaySelection();
})();