(() => {
  const cfg = Object.assign(
    { submissionsEnabled: false, submissionUrl: "", previewMode: true },
    window.MH_SURVEY_CONFIG || {}
  );

  const app = document.getElementById("mh-survey-app");
  const statusEl = document.getElementById("survey-status");

  const state = {
    participant_id: (crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    started_at: new Date().toISOString(),
    responses: {},
    currentStep: 0,
    eligible: null,
    age: null,
    parentPermission: null,
    finished: false,
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
      [1, "I haven’t been doing this at all"], [2, "A little bit"], [3, "A medium amount"], [4, "I’ve been doing this a lot"]
    ]
  };

  const consentHtml = `
    <h2>Consent Form</h2>
    <p><strong>Study Title:</strong> Mental Health, Coping, Grit, and Perceived Stress Among Tertiary-Level Students in Belize</p>
    <p><strong>Principal Investigator:</strong><br>Joy Lee-Shi, MA<br>Faculty of Management &amp; Social Sciences, University of Belize<br>Email: <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
    <p><strong>Collaborator:</strong><br>Mathias R. Vairez Jr., PhD<br>Department of Education, University of Belize<br>Email: <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a></p>

    <h3>Purpose of the Study</h3>
    <p>You are invited to participate in a research study about student mental health and well-being. The purpose of this study is to better understand <strong>tertiary level students’</strong> experiences with mental health, coping skills, grit, and perceived stress.</p>
    <p>This study also aims to evaluate whether the questionnaires used are appropriate and reliable for assessing these experiences among tertiary-level students in Belize.</p>
    <p>You are eligible to participate in this study if you are a student at a tertiary level institution in Belize.</p>

    <h3>What You Will Be Asked to Do</h3>
    <p>If you agree to participate, you will be asked to complete a survey containing questions about your demographic details, experiences with stress, coping strategies, perseverance or grit, and mental health.</p>
    <p>The survey is expected to take about <strong>10 to 20 minutes</strong> to complete.</p>

    <h3>Risks or Discomforts</h3>
    <p>Some questions may ask about personal experiences related to stress or mental health. You may feel uncomfortable, upset, or emotional when answering some questions.</p>
    <p>You may skip any question you do not wish to answer, and you may stop participating at any time without penalty.</p>

    <h3>Potential Benefits</h3>
    <p>As a participant, you will receive a summary of your survey scores related to mental health, coping, grit, and perceived stress. This may help you better understand your mental health, personal strengths, coping patterns, and experiences with stress.</p>
    <p>These scores are intended for informational and self-reflection purposes only and should not be considered a clinical diagnosis or a substitute for professional mental health evaluation or treatment.</p>
    <p>Your participation may also contribute to a better understanding of student mental health and well-being and may help inform future programs or resources designed to support students. Your participation may also help researchers determine whether the scales used in this study are suitable and reliable for tertiary-level students in Belize.</p>

    <h3>Confidentiality</h3>
    <p>The survey is confidential, so your name and other directly identifying information will not be collected. Survey responses will be transmitted to a secure Google-based data system and stored in private Google Sheets within a Google Drive account controlled by the Principal Investigator. Access to the research files will be restricted to the Principal Investigator and Collaborator. The research dataset will not intentionally record your name, IP address, or device identifier.</p>
    <p>We advise against using an employer-issued device to complete this study, as we cannot guarantee the confidentiality of your data regarding the interception of data sent via Internet by third parties (such as your employer).</p>
    <p>If you choose to provide an email address, it will be stored in a separate private file from your survey responses. A randomly generated participant ID will be used to link your email address to your survey response only for the purpose of locating and removing your data if you later request withdrawal. Your email address will not be included in the research dataset used for analysis and will not appear in reports, presentations, or publications.</p>
    <p>The separate file linking optional email addresses to participant IDs will be retained for six months after data collection closes and will then be permanently deleted. After that linkage file is deleted, it may no longer be possible to identify and remove an individual participant's response.</p>
    <p>De-identified survey data will be retained for at least five years after completion of the study and may be retained beyond that period for future related research.</p>
    <p>Results will be reported in a way that does not identify individual participants. When the results of this study are shared, they will be presented as overall patterns and summaries from all participants rather than as individual responses. Your email address or any other information that could identify you will not be included. The findings may be presented at academic conferences or published in research journals.</p>

    <h3>Voluntary Participation</h3>
    <p>Your participation in this study is completely voluntary. You may choose not to participate or may stop participating at any time without penalty. Your decision will not affect your grades, academic standing, relationship with your school, or access to services.</p>
    <p>If you wish to withdraw while completing the survey, you may simply exit the survey at any time. If you decide to withdraw after submitting your responses, you may contact the Principal Investigator to request that your data be removed, provided that your responses can still be identified and linked to you.</p>
    <p>There is no financial compensation for participating in this study.</p>

    <h3>Questions About the Study</h3>
    <p>If you have questions about this study, please contact the Principal Investigator:</p>
    <p>Joy Lee-Shi, M.A.<br>Faculty of Management &amp; Social Sciences, University of Belize<br><a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
    <p>For questions about your rights as a research participant, you may contact:</p>
    <p>Institutional Review Board (IRB)<br>The Research Office, University of Belize<br><a href="mailto:researchoffice@ub.edu.bz">researchoffice@ub.edu.bz</a><br>(501) 822-1000</p>

    <h3>Consent to Participate</h3>
    <p>By clicking “NEXT” to proceed with the survey, you confirm that:</p>
    <ul>
      <li>You have read and understood the information provided above.</li>
      <li>You have had the opportunity to ask questions about the study.</li>
      <li>You understand that participation is voluntary.</li>
      <li>You understand that you may skip questions or stop participating at any time.</li>
      <li>You voluntarily agree to participate in this research study.</li>
    </ul>
    <p>If you do not consent to participating in this study, please close the current browser tab.</p>
  `;

  const parentConsentHtml = `
    <h2>Parent/Guardian Consent Form</h2>
    <p><strong>Study Title:</strong> Mental Health, Coping, Grit, and Perceived Stress Among Tertiary-Level Students in Belize</p>
    <p><strong>Principal Investigator:</strong><br>Joy Lee-Shi, M.A.<br>Faculty of Management &amp; Social Sciences, University of Belize<br>Email: <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a></p>
    <p><strong>Collaborator:</strong><br>Mathias R. Vairez Jr., PhD<br>Department of Education, University of Belize<br>Email: <a href="mailto:mvairez@ub.edu.bz">mvairez@ub.edu.bz</a></p>

    <h3>Invitation to Participate</h3>
    <p>You are being asked to provide permission for a student under the age of 18 to participate in a research study. The purpose of this study is to examine relationships among perceived stress, symptoms of anxiety and depression, grit, and coping strategies among tertiary level students. The study will also examine how well commonly used questionnaires measure these constructs within the study population.</p>
    <p>Because the student is under the age of 18, your permission is required before they may participate in the study.</p>

    <h3>Voluntary Participation</h3>
    <p>Participation is entirely voluntary. Your decision about whether to provide permission will not affect the student's grades, academic standing, access to services, relationship with the institution, or any other benefits to which they are entitled.</p>
    <p>Even if you provide permission, the student may choose not to participate. If they begin the survey, they may stop at any time without penalty and may skip any question they do not wish to answer.</p>

    <h3>Confidentiality</h3>
    <p>The survey is confidential, so your student’s name and other directly identifying information will not be collected. Survey responses will be transmitted to a secure Google-based data system and stored in private Google Sheets within a Google Drive account controlled by the Principal Investigator. Access to the research files will be restricted to the Principal Investigator and Collaborator. The research dataset will not intentionally record your name, IP address, or device identifier.</p>
    <p>If the student chooses to provide an email address, it will be stored in a separate private file from the survey responses. A randomly generated participant ID will be used to link the email address to the student's survey response only for the purpose of locating and removing the student's data if withdrawal is later requested. The email address will not be included in the research dataset used for analysis and will not appear in reports, presentations, or publications.</p>
    <p>The separate file linking optional email addresses to participant IDs will be retained for six months after data collection closes and will then be permanently deleted. After that linkage file is deleted, it may no longer be possible to identify and remove an individual participant's response.</p>
    <p>De-identified survey data will be retained for at least five years after completion of the study and may be retained beyond that period for future related research.</p>

    <h3>What Will the Student Be Asked to Do?</h3>
    <p>If you provide permission and the student agrees to participate, they will be asked to complete an online survey about their experiences and well-being.</p>
    <p>The survey will include demographic and background questions; perceived stress; mental health diagnoses and symptoms related to anxiety and depression; grit; and coping strategies. The survey is expected to take about <strong>10 to 20 minutes</strong>.</p>

    <h3>Statement of Parent/Guardian Permission</h3>
    <p>By providing permission below, you confirm that:</p>
    <ul>
      <li>You have read and understood the information provided about the study.</li>
      <li>You understand that participation is voluntary.</li>
      <li>You understand that the student may decline to participate even if you provide permission.</li>
      <li>You understand that the student may stop participating at any time without penalty.</li>
      <li>You understand that some questions concern potentially sensitive topics, including stress, mental health, and coping.</li>
      <li>You understand that you will not have access to the student's individual survey responses.</li>
      <li>You are the parent or legal guardian of the student and are authorized to provide permission for their participation.</li>
    </ul>
    <fieldset class="survey-question">
      <legend>Parent/guardian permission</legend>
      <div class="survey-options">
        ${radio("parent_permission", "give", "I GIVE permission for the student to participate in this research study.")}
        ${radio("parent_permission", "do_not_give", "I DO NOT GIVE permission for the student to participate in this research study.")}
      </div>
    </fieldset>
    ${cfg.previewMode ? `<p class="survey-note">Technical draft only: please confirm with the IRB that this same-device online parent/guardian permission process is acceptable before using it for recruitment.</p>` : ""}
  `;

  const demographics = [
    { id: "gender", text: "3. What is your gender?", type: "text" },
    { id: "mental_health_diagnosis", text: "4. Have you ever been diagnosed with a mental health condition by a licensed healthcare or mental health professional? Select all that apply.", type: "checkbox", options: ["No", "Anxiety disorder", "Depressive disorder", "Bipolar disorder", "Trauma- or stressor-related disorder (e.g., PTSD)", "Obsessive-compulsive or related disorder", "Eating disorder", "Attention-deficit/hyperactivity disorder (ADHD)", "Substance use disorder", "Other"] },
    { id: "mental_health_diagnosis_other", text: "If Other, please specify:", type: "text" },
    { id: "ethnicity", text: "5. How would you describe your ethnicity? Select all that apply.", type: "checkbox", options: ["Mestizo", "Hispanic/Latino", "Creole", "Garifuna", "Q’eqchi Maya", "Mopan Maya", "Yucatec Maya", "East Indian", "Mennonite", "Chinese", "Caucasian", "Other"] },
    { id: "ethnicity_other", text: "If Other, please specify:", type: "text" },
    { id: "district", text: "6. Where are you based at?", type: "radio", options: ["Corozal", "Orange Walk", "Belize", "Cayes", "Cayo", "Stann Creek", "Toledo"] },
    { id: "study_level", text: "7. What is your current level of study?", type: "radio", options: ["Certificate", "Associate’s degree", "Bachelor’s degree", "Master’s degree", "PhD"] },
    { id: "enrolment_status", text: "8. What is your current enrolment status?", type: "radio", options: ["Full-time student", "Part-time student", "Other"] },
    { id: "enrolment_status_other", text: "If Other, please specify:", type: "text" },
    { id: "area_of_study", text: "9. What is your main area of study?", type: "radio", options: ["Arts and Humanities", "Business and Management", "Education", "Health Sciences", "Science, Technology, Engineering, and Mathematics", "Social and Behavioural Sciences", "Technical or Vocational Studies", "Other"] },
    { id: "area_of_study_other", text: "If Other, please specify:", type: "text" },
    { id: "employment", text: "10. Are you currently employed while attending school?", type: "radio", options: ["No", "Yes, part-time", "Yes, full-time"] },
    { id: "financial_situation", text: "11. How would you describe your current household or family financial situation?", type: "radio", options: ["Very difficult to meet basic expenses", "Somewhat difficult to meet basic expenses", "Able to meet basic expenses, but with little money left over", "Comfortable, with some money available beyond basic expenses", "Very comfortable financially"] }
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
    "I’ve been getting help and advice from other people.",
    "I've been using alcohol or other drugs to help me get through it.",
    "I've been trying to see it in a different light, to make it seem more positive.",
    "I’ve been criticizing myself.",
    "I've been trying to come up with a strategy about what to do.",
    "I've been getting comfort and understanding from someone.",
    "I've been giving up the attempt to cope.",
    "I've been looking for something good in what is happening.",
    "I've been making jokes about it.",
    "I've been doing something to think about it less, such as going to movies, watching TV, reading, daydreaming, sleeping, or shopping.",
    "I've been accepting the reality of the fact that it has happened.",
    "I've been expressing my negative feelings.",
    "I've been trying to find comfort in my religion or spiritual beliefs.",
    "I’ve been trying to get advice or help from other people about what to do.",
    "I've been learning to live with it.",
    "I've been thinking hard about what steps to take.",
    "I’ve been blaming myself for things that happened.",
    "I've been praying or meditating.",
    "I've been making fun of the situation."
  ];

  const steps = [
    { id: "consent", title: "Consent", render: () => consentHtml },
    { id: "eligibility", title: "Eligibility", render: renderEligibility },
    { id: "optional_contact", title: "Optional Contact", render: renderOptionalContact },
    { id: "demographics", title: "Demographics", render: () => renderQuestions("Demographic Information Continued", demographics) },
    { id: "pss", title: "Perceived Stress", render: () => renderScale("PSS-10", "The questions in this scale ask you about your feelings and thoughts during <strong>the last month.</strong> In each case, indicate how often you felt or thought a certain way.", pssItems, scaleOptions.pss, "pss") },
    { id: "phq", title: "Mental Health", render: () => renderScale("PHQ-4", "Over the last two weeks, how often have you been bothered by the following problems?", phqItems, scaleOptions.phq, "phq") },
    { id: "grit", title: "Grit", render: () => renderScale("Grit-S", "Please answer based on your experiences, not how you would like to be. There are no right or wrong answers.", gritItems, scaleOptions.grit, "grit") },
    { id: "cope", title: "Coping", render: () => renderScale("Brief COPE", "These items deal with ways you've been coping with the stress in your life. Read the statements and indicate how much you have been using each coping style.", copeItems, scaleOptions.cope, "cope") },
    { id: "submit", title: "Submit", render: renderSubmit }
  ];

  function radio(name, value, label, checked = false) {
    return `<label class="survey-option"><input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}> <span>${label}</span></label>`;
  }

  function checkbox(name, value, label, checked = false) {
    return `<label class="survey-option"><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}> <span>${label}</span></label>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[ch]));
  }

  function renderEligibility() {
    const enrolled = state.responses.currently_enrolled || "";
    const age = state.responses.age ?? "";
    return `
      <h2>Demographic Information</h2>
      <p>The following questions will help us describe the group of students who participated in this study. Please select the response that best describes you.</p>
      <fieldset class="survey-question">
        <legend>1. Are you currently enrolled at a tertiary-level institution in Belize?</legend>
        <div class="survey-options">
          ${radio("currently_enrolled", "Yes", "Yes", enrolled === "Yes")}
          ${radio("currently_enrolled", "No", "No", enrolled === "No")}
        </div>
      </fieldset>
      <div class="survey-question">
        <label for="age">2. What is your age?</label>
        <input class="survey-number" id="age" name="age" type="number" min="1" max="120" inputmode="numeric" value="${escapeHtml(age)}"> <span>years</span>
      </div>
    `;
  }

  function renderQuestions(title, questions) {
    return `<h2>${title}</h2>${questions.map(q => renderQuestion(q)).join("")}`;
  }

  function renderQuestion(q) {
    const current = state.responses[q.id];
    if (q.type === "text") {
      return `<div class="survey-question"><label for="${q.id}">${q.text}</label><input class="survey-text" id="${q.id}" name="${q.id}" type="text" value="${escapeHtml(current || "")}"></div>`;
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
      <p>You may provide an email address if you would like the Principal Investigator to be able to locate your survey response if you later request to withdraw your data. Providing an email address is <strong>optional</strong>.</p>
      <p>Your email address will be stored separately from your survey responses and linked only through your random participant ID. It will be used only for withdrawal-related purposes and will not be included in the research dataset used for analysis.</p>
      <div class="survey-question">
        <label for="withdrawal_email">Email address (optional)</label>
        <input class="survey-text" id="withdrawal_email" name="withdrawal_email" type="email" autocomplete="email" inputmode="email" value="${escapeHtml(email)}" placeholder="name@example.com">
      </div>
      <p class="survey-note">If you do not provide an email address, you may still use the participant ID shown after submission when contacting the Principal Investigator about withdrawal.</p>
    `;
  }

  function renderSubmit() {
    return `
      <h2>Submit Survey</h2>
      <p>You may review previous sections using the Back button. Questions may be skipped.</p>
      ${cfg.submissionsEnabled && cfg.submissionUrl
        ? `<p>When you submit, your responses will be transmitted to the study's configured data endpoint.</p>`
        : `<div class="survey-banner warning">Data collection is currently disabled. This is an ethics-review/testing build and will not send responses anywhere.</div>`}
      <p class="survey-note">Participant ID for this browser session: <code>${escapeHtml(state.participant_id)}</code></p>
    `;
  }

  function renderParentConsentStep() {
    return `
      <div class="survey-progress-wrap">
        <div class="survey-progress-label"><span>Parent/guardian permission</span><span>Required for participants under 18</span></div>
        <div class="survey-progress"><div style="width: 20%"></div></div>
      </div>
      <div class="survey-card">${parentConsentHtml}</div>
      <div class="survey-actions">
        <button class="btn btn-outline-secondary" type="button" data-action="back-from-parent">Back</button>
        <button class="btn btn-primary" type="button" data-action="parent-next">NEXT</button>
      </div>
    `;
  }

  function render() {
    if (state.finished) return;

    if (state.currentStep === 2 && Number(state.age) < 18 && state.parentPermission === null) {
      app.innerHTML = renderParentConsentStep();
      bindActions();
      return;
    }

    const step = steps[state.currentStep];
    const pct = Math.round(((state.currentStep + 1) / steps.length) * 100);
    const nextLabel = step.id === "submit" ? (cfg.submissionsEnabled ? "Submit Survey" : "Preview Debrief") : "NEXT";

    app.innerHTML = `
      ${cfg.previewMode ? `<div class="survey-banner warning">Preview mode: submissions are disabled.</div>` : ""}
      <div class="survey-progress-wrap">
        <div class="survey-progress-label"><span>${escapeHtml(step.title)}</span><span>${state.currentStep + 1} of ${steps.length}</span></div>
        <div class="survey-progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="survey-card">${step.render()}</div>
      <div class="survey-actions">
        ${state.currentStep > 0 ? `<button class="btn btn-outline-secondary" type="button" data-action="back">Back</button>` : `<span></span>`}
        <button class="btn btn-primary" type="button" data-action="next">${nextLabel}</button>
      </div>
    `;
    bindActions();
  }

  function collectVisibleInputs() {
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

  function bindActions() {
    app.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        collectVisibleInputs();

        if (action === "back") {
          state.currentStep = Math.max(0, state.currentStep - 1);
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (action === "back-from-parent") {
          state.currentStep = 1;
          state.parentPermission = null;
          render();
          return;
        }

        if (action === "parent-next") {
          const permission = state.responses.parent_permission;
          if (!permission) {
            setStatus("Please select whether permission is given before continuing.", true);
            return;
          }
          state.parentPermission = permission;
          if (permission !== "give") {
            renderEnded("Parent/guardian permission was not provided. The survey has ended.");
            return;
          }
          state.currentStep = 2;
          render();
          return;
        }

        if (action === "next") {
          const step = steps[state.currentStep];

          if (step.id === "eligibility") {
            const enrolled = state.responses.currently_enrolled;
            const ageVal = Number(state.responses.age);
            if (!enrolled || !Number.isFinite(ageVal) || ageVal <= 0) {
              setStatus("Please answer the enrolment and age questions so the survey can determine eligibility.", true);
              return;
            }
            state.eligible = enrolled === "Yes";
            state.age = ageVal;
            if (!state.eligible) {
              renderEnded("Thank you for your interest. This study is for students currently enrolled at a tertiary-level institution in Belize, so the survey has ended.");
              return;
            }
          }

          if (step.id === "optional_contact") {
            const emailInput = app.querySelector("#withdrawal_email");
            if (emailInput && emailInput.value && !emailInput.checkValidity()) {
              setStatus("Please enter a valid email address or leave the email field blank.", true);
              return;
            }
          }

          if (step.id === "submit") {
            await finishSurvey();
            return;
          }

          state.currentStep += 1;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  async function finishSurvey() {
    const submittedAt = new Date().toISOString();
    const { withdrawal_email: withdrawalEmail, ...surveyResponses } = state.responses;
    const payload = {
      participant_id: state.participant_id,
      started_at: state.started_at,
      submitted_at: submittedAt,
      age: state.age,
      parent_permission: state.parentPermission,
      responses: surveyResponses,
      contact: withdrawalEmail ? {
        participant_id: state.participant_id,
        email: withdrawalEmail,
        submitted_at: submittedAt
      } : null
    };

    if (cfg.submissionsEnabled && cfg.submissionUrl) {
      try {
        // text/plain avoids a CORS preflight with Apps Script. The response is opaque in no-cors mode.
        await fetch(cfg.submissionUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload)
        });
        setStatus("Your response was submitted.", false);
      } catch (err) {
        console.error(err);
        setStatus("The survey could not confirm submission. Please do not resubmit until the study team checks the data system.", true);
        return;
      }
    }

    state.finished = true;
    app.innerHTML = renderDebrief(payload);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scoreSummary() {
    // PSS-10 scoring is implemented only as a raw research total where all 10 items are present.
    // Items 4, 5, 7, and 8 are reverse-scored (0<->4, 1<->3, 2 stays 2).
    const pssVals = Array.from({ length: 10 }, (_, i) => state.responses[`pss${i + 1}`]);
    let pss = null;
    if (pssVals.every(v => v !== undefined && v !== "")) {
      pss = pssVals.map(Number).reduce((sum, v, idx) => sum + ([3,4,6,7].includes(idx) ? 4 - v : v), 0);
    }

    // PHQ-4 raw total and two 2-item subscales, only where all relevant items are present.
    const phqVals = Array.from({ length: 4 }, (_, i) => state.responses[`phq${i + 1}`]);
    let phqTotal = null, anxiety = null, depression = null;
    if (phqVals.every(v => v !== undefined && v !== "")) {
      const nums = phqVals.map(Number);
      phqTotal = nums.reduce((a, b) => a + b, 0);
      anxiety = nums[0] + nums[1];
      depression = nums[2] + nums[3];
    }

    return { pss, phqTotal, anxiety, depression };
  }

  function renderDebrief() {
    const s = scoreSummary();
    return `
      <div class="survey-card">
        <h2>Debriefing Form</h2>
        <p><strong>Study Title:</strong> Mental Health, Coping, Grit, and Perceived Stress Among Tertiary-Level Students in Belize</p>
        <p>The purpose of this research is to better understand tertiary-level students’ experiences with mental health, coping skills, grit, and perceived stress. The study also aims to examine whether the questionnaires used are reliable and appropriate for use with tertiary-level students.</p>

        <h3>Your score summary</h3>
        <p>These scores are provided for informational and self-reflection purposes only. They are <strong>not a medical or psychological diagnosis</strong> and cannot replace an assessment by a qualified mental health professional.</p>
        <div class="survey-score-grid">
          <div class="survey-score-box"><strong>PSS-10 raw total</strong>${s.pss === null ? "Not calculated because one or more items were skipped." : escapeHtml(s.pss)}</div>
          <div class="survey-score-box"><strong>PHQ-4 raw total</strong>${s.phqTotal === null ? "Not calculated because one or more items were skipped." : escapeHtml(s.phqTotal)}</div>
          <div class="survey-score-box"><strong>PHQ-4 anxiety subscale</strong>${s.anxiety === null ? "Not calculated because one or more items were skipped." : escapeHtml(s.anxiety)}</div>
          <div class="survey-score-box"><strong>PHQ-4 depression subscale</strong>${s.depression === null ? "Not calculated because one or more items were skipped." : escapeHtml(s.depression)}</div>
        </div>
        <div class="survey-banner warning">Grit-S and Brief COPE score reporting is intentionally not automated in this draft. Your instrument includes a study-specific Grit-S reversal note, and the exact participant-facing scoring/reporting rules should be finalized before launch.</div>

        <h3>About the questionnaires</h3>
        <p><strong>Perceived Stress Scale (PSS-10):</strong> asks about how stressful, unpredictable, or overwhelming you have found situations in your life recently, including perceived helplessness and perceived self-efficacy.</p>
        <p><strong>Patient Health Questionnaire-4 (PHQ-4):</strong> asks about symptoms related to anxiety and depression. It is a brief screening tool and does not provide a clinical diagnosis.</p>
        <p><strong>Short Grit Scale (Grit-S):</strong> assesses perseverance of effort and consistency of interest toward long-term goals.</p>
        <p><strong>Brief COPE:</strong> explores coping strategies including active coping, planning, positive reframing, acceptance, emotional support, instrumental support, self-distraction, venting, denial, behavioural disengagement, self-blame, humour, religion, and substance use.</p>

        <h3>Emotional Well-being and Support</h3>
        <p>In this study, we asked about your experiences relating to mental health, coping, grit, and perceived stress, which may have brought up strong emotions. We encourage you to reach out to a friend, family member, or a mental health professional if you feel distressed.</p>
        <p>Online Directory of Mental Health Professionals in Belize: <a href="https://www.mindhealthconnect.com/professionals-in-the-field/" target="_blank" rel="noopener noreferrer">Mind Health Connect</a></p>
        <p>Free or affordable mental health support can also be found at Community Counseling Center branches:</p>
        <ul>
          <li>Belize District: Lake Independence Blvd (Chetumal St.). Phone: 227-1406 / 227-4003</li>
          <li>Corozal District. Phone: 402-2120</li>
          <li>Cayo District. Phone: 804-2098</li>
          <li>Orange Walk District: Betias Lane. Phone: 302-2058</li>
          <li>Stann Creek District: 8 Pen Road. Phone: 502-0038</li>
          <li>Toledo District. Phone: 702-2021</li>
        </ul>
        <p>If you believe you are in immediate danger or may harm yourself or someone else, please contact your local emergency services or go to the nearest emergency department.</p>

        <h3>Your Participant ID</h3>
        <p>Your participant ID is <code>${escapeHtml(state.participant_id)}</code>. You may save this ID if you think you may later wish to request withdrawal of your response.</p>

        <h3>Confidentiality and Privacy</h3>
        <p>Your research data will be kept confidential. Survey responses are stored separately from optional email contact information and linked only by the participant ID above. Access to the research files will be restricted to the Principal Investigator and Collaborator. When findings are shared, they will be presented as general patterns and summaries across participants. Identifying information will not be included in presentations, reports, or publications.</p>

        <h3>Questions About the Study</h3>
        <p>If you have questions about this study, or if you would like to receive a copy of this study’s findings, please contact Joy Lee-Shi, M.A., Faculty of Management &amp; Social Sciences, University of Belize at <a href="mailto:joy.lee-shi@ub.edu.bz">joy.lee-shi@ub.edu.bz</a>.</p>
        <p>You may also contact the Principal Investigator to request that your data be removed.</p>
        <p>For questions about your rights as a research participant, or any complaints you may have, contact the Institutional Review Board (IRB), The Research Office, University of Belize, <a href="mailto:researchoffice@ub.edu.bz">researchoffice@ub.edu.bz</a>, (501) 822-1000.</p>
        <p><strong>Thank you for your participation and for contributing to research on student mental health and well-being.</strong></p>
      </div>
    `;
  }

  function renderEnded(message) {
    state.finished = true;
    app.innerHTML = `<div class="survey-card survey-ineligible"><h2>Survey Ended</h2><p>${escapeHtml(message)}</p></div>`;
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.style.fontWeight = isError ? "650" : "400";
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  render();
})();
