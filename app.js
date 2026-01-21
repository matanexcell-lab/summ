// =====================
// נתונים קבועים
// =====================

const ACTION_TYPES = ["ניוד", "השארה", "פתיחת קופה", "פרט"];

const INVEST_COMPANIES = [
  "מגדל",
  "כלל",
  "הראל",
  "אלטשולר שחם",
  "ילין לפידות",
  "אנליסט",
  "מיטב",
  "מור",
  "הפניקס",
  "הכשרה",
  "מנורה",
  "איילון",
  "ביטוח ישיר"
];

const INSURANCE_COMPANIES = [
  "מגדל",
  "כלל",
  "הראל",
  "הפניקס",
  "הכשרה",
  "מנורה",
  "איילון",
  "ביטוח ישיר"
];

const PRODUCTS = ["קרן פנסיה", "קרן השתלמות", "קופת גמל", "קופת גמל להשקעה"];

const PRIVATE_PRODUCTS = [
  "פוליסת חיים",
  "פוליסת חיים משועבדת",
  "פוליסת משכנתא",
  "ביטוח בריאות",
  "ביטוח בריאות ומחלות קשות"
];

const PRIVATE_ACTIONS = [
  "ביטול",
  "השארה",
  "הפקה",
  "מינוי סוכן",
  "ביטול והפקה חדשה"
];

const BASE_TRACKS = [
  "כללי",
  "לבני 50 ומטה",
  "לבני 50-60",
  "לבני 60 ומעלה",
  "מניות",
  "Snp500",
  "משולב סחיר",
  "עוקב מדדים גמיש",
  "מניות סחיר",
  "עוקב מדדי מניות",
  "השלוש הקדוש",
  "חצי חצי אנליסט"
];

const SPECIAL_TRACK_OUTPUT = {
  "השלוש הקדוש": "33% משולב סחיר, 33% מדדי מניות, 34% Snp500",
  "חצי חצי אנליסט": "50% עוקב מדדים גמיש, 50% Snp500"
};

const EMPLOYMENT_TYPES = ["שכירה", "עצמאית", "ללא"];

const MODE_SUMMARY = "סיכום הדברים";
const MODE_RECOMMENDATION = "המלצות";

const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשת".split("");

// =====================
// סטייט גלובלי
// =====================

let mode = MODE_SUMMARY;
let totalActions = 1;
let currentActionIndex = 0;
let currentStep = "mode"; // מזהה צעד
let history = []; // בשביל כפתור חזרה

const actions = []; // [{...}]

// =====================
// עזרים
// =====================

function getCurrentAction() {
  if (!actions[currentActionIndex]) {
    actions[currentActionIndex] = {
      index: currentActionIndex,
      type: null,
      reasons: []
    };
  }
  return actions[currentActionIndex];
}

function setSubtitle(text) {
  document.getElementById("subtitle").textContent = text || "";
}

function setStepIndicator() {
  const el = document.getElementById("stepIndicator");
  if (currentStep === "mode" || currentStep === "totalActions") {
    el.textContent = "";
    return;
  }
  el.textContent = `פעולה ${currentActionIndex + 1} מתוך ${totalActions}`;
}

function setModePill() {
  const pill = document.getElementById("modePill");
  pill.classList.remove("hidden");
  pill.textContent =
    mode === MODE_SUMMARY ? "מצב: סיכום דברים" : "מצב: המלצות";
}

function createSelect(id, options, value) {
  const htmlOptions = options
    .map(
      (opt) =>
        `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt}</option>`
    )
    .join("");
  return `<select id="${id}">
    <option value="">בחר...</option>
    ${htmlOptions}
    <option value="אחר">אחר...</option>
  </select>`;
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value != null ? value : "";
}

function showError(msg) {
  return `<div class="error-text">${msg}</div>`;
}

function formatTrack(track) {
  if (SPECIAL_TRACK_OUTPUT[track]) {
    return SPECIAL_TRACK_OUTPUT[track];
  }
  return track;
}

function formatCompanyWithOther(selected, other) {
  if (selected === "אחר") return other || "";
  return selected || "";
}

// =====================
// רנדר לצעד
// =====================

function render() {
  const container = document.getElementById("formContainer");
  const summaryBox = document.getElementById("summaryBox");
  summaryBox.classList.add("hidden");
  summaryBox.textContent = "";

  setStepIndicator();
  setModePill();

  let html = "";
  let action = getCurrentAction();

  switch (currentStep) {
    case "mode":
      setSubtitle("");
      html += `<div class="question-title">האם זה סיכום של הדברים או המלצות?</div>`;
      html += createSelect("modeSelect", [MODE_SUMMARY, MODE_RECOMMENDATION], mode);
      if (mode === MODE_RECOMMENDATION) {
        html += `<div class="helper-text">במצב המלצות ניתן להוסיף נימוקים אחרי כל פעולה.</div>`;
      }
      break;

    case "totalActions":
      setSubtitle("");
      html += `<div class="question-title">כמה פעולות אתה רוצה לרשום?</div>`;
      html += `<input type="number" id="actionsCount" min="1" max="20" value="${totalActions}" />`;
      html += `<div class="helper-text">אפשר לשנות אחר כך אם צריך.</div>`;
      break;

    case "actionType":
      setSubtitle("בחר את סוג הפעולה");
      html += `<div class="question-title">מה סוג הפעולה?</div>`;
      html += createSelect("actionTypeSelect", ACTION_TYPES, action.type);
      break;

    // ===== פנסיוני / השקעות =====
    case "company":
      setSubtitle("פרטי החברה והמוצר");
      html += `<div class="field-label">מה שם החברה?</div>`;
      html += createSelect("companySelect", INVEST_COMPANIES, action.company);
      html += `<input type="text" id="companyOther" placeholder="שם החברה (אם נבחר 'אחר')" style="margin-top:6px;" value="${action.companyOther || ""}" />`;
      break;

    case "product":
      setSubtitle("פרטי החברה והמוצר");
      html += `<div class="field-label">מה סוג המוצר?</div>`;
      html += createSelect("productSelect", PRODUCTS, action.product);
      html += `<input type="text" id="productOther" placeholder="סוג מוצר (אם נבחר 'אחר')" style="margin-top:6px;" value="${action.productOther || ""}" />`;
      break;

    case "employment":
      setSubtitle("מצב תעסוקתי");
      html += `<div class="field-label">האם הלקוח שכיר, עצמאי או כלום?</div>`;
      html += createSelect("employmentSelect", EMPLOYMENT_TYPES, action.employmentType);
      html += `<input type="text" id="employerName" placeholder="שם המעסיק (אם שכירה)" style="margin-top:6px;" value="${action.employerName || ""}" />`;
      html += `<input type="number" id="selfDeposit" placeholder="סכום הפקדה (אם עצמאי)" style="margin-top:6px;" value="${action.selfDeposit || ""}" />`;
      break;

    case "kgiDeposit":
      setSubtitle("אופי ההפקדה");
      html += `<div class="field-label">האם יש הפקדה לקופת גמל להשקעה?</div>`;
      html += createSelect(
        "kgiDepositType",
        ["ללא הפקדה", "הוראת קבע", "חד פעמי", "גם וגם"],
        action.kgiDepositType
      );
      html += `<input type="number" id="kgiMonthly" placeholder="סכום הוראת קבע חודשית" style="margin-top:6px;" value="${action.kgiMonthly || ""}" />`;
      html += `<input type="number" id="kgiOneTime" placeholder="סכום הפקדה חד פעמית" style="margin-top:6px;" value="${action.kgiOneTime || ""}" />`;
      break;

    case "transferTargetCompany":
      setSubtitle("ניוד קופה");
      html += `<div class="field-label">לאיזו חברה תנויד הקופה?</div>`;
      html += createSelect(
        "targetCompanySelect",
        INVEST_COMPANIES,
        action.targetCompany
      );
      html += `<input type="text" id="targetCompanyOther" placeholder="שם חברה (אם 'אחר')" style="margin-top:6px;" value="${action.targetCompanyOther || ""}" />`;
      break;

    case "accountNumber":
      setSubtitle("פרטי קופה");
      html += `<div class="field-label">מה מספר הקופה?</div>`;
      html += `<input type="text" id="accountNumberInput" value="${action.accountNumber || ""}" />`;
      break;

    case "keepType":
      setSubtitle("קופה קיימת");
      html += `<div class="field-label">כאשר הקופה נשארת – מה יקרה?</div>`;
      html += createSelect(
        "keepTypeSelect",
        ["ללא שינוי", "שינוי מסלול השקעה", "מינוי סוכן"],
        action.keepType
      );
      break;

    case "currentTrack":
      setSubtitle("שינוי מסלול השקעה");
      html += `<div class="field-label">מה מסלול ההשקעה הנוכחי?</div>`;
      html += createSelect("currentTrackSelect", BASE_TRACKS, action.currentTrack);
      html += `<input type="text" id="currentTrackOther" placeholder="מסלול אחר (אם 'אחר')" style="margin-top:6px;" value="${action.currentTrackOther || ""}" />`;
      break;

    case "newTrack":
      setSubtitle("מסלול השקעה עתידי");
      html += `<div class="field-label">מהו מסלול ההשקעה החדש?</div>`;
      html += createSelect("newTrackSelect", BASE_TRACKS, action.newTrack);
      html += `<input type="text" id="newTrackOther" placeholder="מסלול אחר (אם 'אחר')" style="margin-top:6px;" value="${action.newTrackOther || ""}" />`;
      break;

    case "trackForOpen":
      setSubtitle("מסלול להשקעה");
      html += `<div class="field-label">באיזה מסלול יושקע הכסף?</div>`;
      html += createSelect(
        "openTrackSelect",
        BASE_TRACKS,
        action.openTrack
      );
      html += `<input type="text" id="openTrackOther" placeholder="מסלול אחר (אם 'אחר')" style="margin-top:6px;" value="${action.openTrackOther || ""}" />`;
      break;

    case "managementFee":
      setSubtitle("דמי ניהול");
      html += `<div class="field-label">מהם דמי הניהול?</div>`;

      if (action.product === "קרן פנסיה") {
        html += createSelect(
          "mgmtSelect",
          [
            "0.1% מצבירה ועוד 1.5% מהפקדה",
            "0.15% מצבירה ועוד 1.5% מהפקדה"
          ],
          action.managementFee
        );
      } else if (
        ["קרן השתלמות", "קופת גמל", "קופת גמל להשקעה"].includes(
          action.product
        )
      ) {
        html += createSelect(
          "mgmtSelect",
          ["0.6%", "0.7%", "0.8%"],
          action.managementFee
        );
      } else {
        html += `<input type="text" id="mgmtSelect" value="${
          action.managementFee || ""
        }" />`;
      }
      html += `<input type="text" id="mgmtOther" placeholder="דמי ניהול אחרים (אם 'אחר')" style="margin-top:6px;" value="${action.managementFeeOther || ""}" />`;
      break;

    // ===== פרט / ביטוח =====
    case "privateCompany":
      setSubtitle("פרטי החברה");
      html += `<div class="field-label">מה שם החברה?</div>`;
      html += createSelect(
        "privateCompanySelect",
        INSURANCE_COMPANIES,
        action.privateCompany
      );
      html += `<input type="text" id="privateCompanyOther" placeholder="שם חברה (אם 'אחר')" style="margin-top:6px;" value="${action.privateCompanyOther || ""}" />`;
      break;

    case "privateProduct":
      setSubtitle("סוג ביטוח");
      html += `<div class="field-label">מה סוג הביטוח?</div>`;
      html += createSelect(
        "privateProductSelect",
        PRIVATE_PRODUCTS,
        action.privateProduct
      );
      html += `<input type="text" id="privateProductOther" placeholder="סוג ביטוח (אם 'אחר')" style="margin-top:6px;" value="${action.privateProductOther || ""}" />`;
      break;

    case "privateAction":
      setSubtitle("פעולה בפוליסה");
      html += `<div class="field-label">מה סוג הפעולה בפוליסה?</div>`;
      html += createSelect(
        "privateActionSelect",
        PRIVATE_ACTIONS,
        action.privateAction
      );
      break;

    case "policyNumber":
      setSubtitle("פרטי פוליסה");
      html += `<div class="field-label">מה מספר הפוליסה?</div>`;
      html += `<input type="text" id="policyNumberInput" value="${action.policyNumber || ""}" />`;
      break;

    case "insuranceSum":
      setSubtitle("סכום ביטוח");
      html += `<div class="field-label">מהו סכום הביטוח (פיצוי)?</div>`;
      html += `<input type="number" id="insuranceSumInput" value="${action.insuranceSum || ""}" />`;
      break;

    case "newPolicyDetails":
      setSubtitle("פרטי הפוליסה החדשה");
      html += `<div class="field-label">סוג הביטוח החדש:</div>`;
      html += createSelect(
        "newPolicyTypeSelect",
        PRIVATE_PRODUCTS,
        action.newPolicyType
      );
      html += `<input type="text" id="newPolicyTypeOther" placeholder="סוג ביטוח (אם 'אחר')" style="margin-top:6px;" value="${action.newPolicyTypeOther || ""}" />`;
      html += `<div class="field-label" style="margin-top:10px;">באיזו חברה תופק הפוליסה החדשה?</div>`;
      html += createSelect(
        "newPolicyCompanySelect",
        INSURANCE_COMPANIES,
        action.newPolicyCompany
      );
      html += `<input type="text" id="newPolicyCompanyOther" placeholder="שם חברה (אם 'אחר')" style="margin-top:6px;" value="${action.newPolicyCompanyOther || ""}" />`;
      html += `<div class="field-label" style="margin-top:10px;">מה הפרמיה החודשית?</div>`;
      html += `<input type="number" id="newPolicyPremium" value="${action.newPolicyPremium || ""}" />`;
      break;

    // ===== נימוקים =====
    case "reasons":
      setSubtitle("נימוקים להמלצה");
      html += `<div class="field-label">כתוב נימוק להמלצה זו:</div>`;
      html += `<textarea id="reasonInput" placeholder="לדוגמה: דמי ניהול נמוכים יותר, תשואות טובות יותר וכו'"></textarea>`;
      if (action.reasons && action.reasons.length) {
        html += `<div class="field-label" style="margin-top:10px;">נימוקים שנוספו:</div><ul>`;
        action.reasons.forEach((r, idx) => {
          const letter =
            action.reasons.length > 1 ? `${HEBREW_LETTERS[idx]}. ` : "";
          html += `<li>${letter}${r}</li>`;
        });
        html += `</ul>`;
      }
      html += `<button type="button" class="btn btn-secondary btn-small" id="addReasonBtn">הוסף נימוק נוסף</button>`;
      break;

    default:
      break;
  }

  container.innerHTML = html;

  // כפתור נימוק נוסף
  const addBtn = document.getElementById("addReasonBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      const txt = getValue("reasonInput");
      if (!txt) return;
      action.reasons = action.reasons || [];
      action.reasons.push(txt);
      document.getElementById("reasonInput").value = "";
      render();
    };
  }

  // להסתיר כפתור חזרה בצעד הראשון
  document.getElementById("backBtn").disabled =
    history.length === 0 && currentStep === "mode";
}

// =====================
// שמירת צעד וחישוב הצעד הבא
// =====================

function saveCurrentStep() {
  const a = getCurrentAction();

  switch (currentStep) {
    case "mode": {
      const v = getValue("modeSelect");
      if (!v) {
        alert("בחר מצב: סיכום הדברים או המלצות.");
        return false;
      }
      mode = v;
      return true;
    }
    case "totalActions": {
      let n = parseInt(getValue("actionsCount"), 10);
      if (!n || n < 1) {
        alert("נא להזין מספר פעולות תקין.");
        return false;
      }
      totalActions = n;
      actions.length = totalActions;
      return true;
    }
    case "actionType": {
      const t = getValue("actionTypeSelect");
      if (!t) {
        alert("נא לבחור סוג פעולה.");
        return false;
      }
      a.type = t;
      return true;
    }

    case "company": {
      a.company = getValue("companySelect");
      a.companyOther = getValue("companyOther");
      if (!a.company && !a.companyOther) {
        alert("נא לבחור חברה או לכתוב שם חברה.");
        return false;
      }
      return true;
    }

    case "product": {
      a.product = getValue("productSelect");
      a.productOther = getValue("productOther");
      if (!a.product && !a.productOther) {
        alert("נא לבחור סוג מוצר או לכתוב אותו.");
        return false;
      }
      return true;
    }

    case "employment": {
      a.employmentType = getValue("employmentSelect");
      a.employerName = getValue("employerName");
      a.selfDeposit = getValue("selfDeposit");

      if (a.employmentType === "שכירה" && !a.employerName) {
        alert("נא לרשום שם מעסיק.");
        return false;
      }
      if (a.employmentType === "עצמאית" && !a.selfDeposit) {
        alert("נא לרשום סכום הפקדה.");
        return false;
      }
      return true;
    }

    case "kgiDeposit": {
      a.kgiDepositType = getValue("kgiDepositType");
      a.kgiMonthly = getValue("kgiMonthly");
      a.kgiOneTime = getValue("kgiOneTime");
      if (!a.kgiDepositType) {
        alert("נא לבחור אופי הפקדה.");
        return false;
      }
      if (
        (a.kgiDepositType === "הוראת קבע" ||
          a.kgiDepositType === "גם וגם") &&
        !a.kgiMonthly
      ) {
        alert("נא להזין סכום הוראת קבע.");
        return false;
      }
      if (
        (a.kgiDepositType === "חד פעמי" ||
          a.kgiDepositType === "גם וגם") &&
        !a.kgiOneTime
      ) {
        alert("נא להזין סכום הפקדה חד פעמית.");
        return false;
      }
      return true;
    }

    case "transferTargetCompany": {
      a.targetCompany = getValue("targetCompanySelect");
      a.targetCompanyOther = getValue("targetCompanyOther");
      if (!a.targetCompany && !a.targetCompanyOther) {
        alert("נא לבחור חברה אליה תנויד הקופה או לכתוב שם חברה.");
        return false;
      }
      return true;
    }

    case "accountNumber": {
      a.accountNumber = getValue("accountNumberInput");
      if (!a.accountNumber) {
        alert("נא להזין מספר קופה.");
        return false;
      }
      return true;
    }

    case "keepType": {
      a.keepType = getValue("keepTypeSelect");
      if (!a.keepType) {
        alert("נא לבחור מה יקרה בקופה.");
        return false;
      }
      return true;
    }

    case "currentTrack": {
      a.currentTrack = getValue("currentTrackSelect");
      a.currentTrackOther = getValue("currentTrackOther");
      if (!a.currentTrack && !a.currentTrackOther) {
        alert("נא לבחור מסלול נוכחי או לרשום אחד.");
        return false;
      }
      return true;
    }

    case "newTrack": {
      a.newTrack = getValue("newTrackSelect");
      a.newTrackOther = getValue("newTrackOther");
      if (!a.newTrack && !a.newTrackOther) {
        alert("נא לבחור מסלול חדש או לרשום אחד.");
        return false;
      }
      return true;
    }

    case "trackForOpen": {
      a.openTrack = getValue("openTrackSelect");
      a.openTrackOther = getValue("openTrackOther");
      if (!a.openTrack && !a.openTrackOther) {
        alert("נא לבחור מסלול השקעה או לרשום אחד.");
        return false;
      }
      return true;
    }

    case "managementFee": {
      a.managementFee = getValue("mgmtSelect");
      a.managementFeeOther = getValue("mgmtOther");
      if (!a.managementFee && !a.managementFeeOther) {
        alert("נא להזין דמי ניהול.");
        return false;
      }
      return true;
    }

    case "privateCompany": {
      a.privateCompany = getValue("privateCompanySelect");
      a.privateCompanyOther = getValue("privateCompanyOther");
      if (!a.privateCompany && !a.privateCompanyOther) {
        alert("נא לבחור חברה או לרשום אחת.");
        return false;
      }
      return true;
    }

    case "privateProduct": {
      a.privateProduct = getValue("privateProductSelect");
      a.privateProductOther = getValue("privateProductOther");
      if (!a.privateProduct && !a.privateProductOther) {
        alert("נא לבחור סוג ביטוח או לרשום אחד.");
        return false;
      }
      return true;
    }

    case "privateAction": {
      a.privateAction = getValue("privateActionSelect");
      if (!a.privateAction) {
        alert("נא לבחור סוג פעולה בפוליסה.");
        return false;
      }
      return true;
    }

    case "policyNumber": {
      a.policyNumber = getValue("policyNumberInput");
      if (!a.policyNumber) {
        alert("נא להזין מספר פוליסה.");
        return false;
      }
      return true;
    }

    case "insuranceSum": {
      a.insuranceSum = getValue("insuranceSumInput");
      if (!a.insuranceSum) {
        alert("נא להזין סכום ביטוח.");
        return false;
      }
      return true;
    }

    case "newPolicyDetails": {
      a.newPolicyType = getValue("newPolicyTypeSelect");
      a.newPolicyTypeOther = getValue("newPolicyTypeOther");
      a.newPolicyCompany = getValue("newPolicyCompanySelect");
      a.newPolicyCompanyOther = getValue("newPolicyCompanyOther");
      a.newPolicyPremium = getValue("newPolicyPremium");

      if (!a.newPolicyType && !a.newPolicyTypeOther) {
        alert("נא לבחור סוג ביטוח חדש או לרשום אחד.");
        return false;
      }
      if (!a.newPolicyCompany && !a.newPolicyCompanyOther) {
        alert("נא לבחור חברה חדשה או לרשום אחת.");
        return false;
      }
      if (!a.newPolicyPremium) {
        alert("נא להזין פרמיה חודשית.");
        return false;
      }
      return true;
    }

    case "reasons": {
      const txt = getValue("reasonInput");
      if (txt) {
        a.reasons = a.reasons || [];
        a.reasons.push(txt);
      }
      return true;
    }

    default:
      return true;
  }
}

function computeNextStep() {
  const a = getCurrentAction();

  if (currentStep === "mode") return "totalActions";
  if (currentStep === "totalActions") {
    currentActionIndex = 0;
    return "actionType";
  }

  // ----- שלבים משותפים לכל פעולה -----
  if (currentStep === "actionType") {
    if (a.type === "פרט") {
      return "privateCompany";
    } else {
      return "company";
    }
  }

  // ----- פנסיוני / השקעות -----
  if (a.type !== "פרט") {
    switch (currentStep) {
      case "company":
        return "product";

      case "product":
        if (["קרן פנסיה", "קרן השתלמות", "קופת גמל"].includes(a.product)) {
          return "employment";
        }
        if (a.product === "קופת גמל להשקעה") {
          return "kgiDeposit";
        }
        return "managementFee";

      case "employment":
        if (a.product === "קופת גמל להשקעה") return "kgiDeposit";
        return a.type === "פתיחת קופה"
          ? "trackForOpen"
          : a.type === "ניוד"
          ? "transferTargetCompany"
          : "keepType";

      case "kgiDeposit":
        return a.type === "פתיחת קופה"
          ? "trackForOpen"
          : a.type === "ניוד"
          ? "transferTargetCompany"
          : "keepType";

      case "transferTargetCompany":
        return "accountNumber";

      case "accountNumber":
        return "trackForOpen";

      case "keepType":
        if (a.keepType === "שינוי מסלול השקעה") return "currentTrack";
        if (a.keepType === "מינוי סוכן") return "accountNumber";
        return "managementFee";

      case "currentTrack":
        return "newTrack";

      case "newTrack":
        return "managementFee";

      case "trackForOpen":
        return "managementFee";

      case "managementFee":
        if (mode === MODE_RECOMMENDATION) {
          return "reasons";
        } else {
          return advanceActionOrFinish();
        }

      case "reasons":
        return advanceActionOrFinish();

      default:
        return null;
    }
  }

  // ----- פרט / ביטוח -----
  else {
    switch (currentStep) {
      case "privateCompany":
        return "privateProduct";

      case "privateProduct":
        return "privateAction";

      case "privateAction":
        if (["ביטול", "השארה", "ביטול והפקה חדשה"].includes(a.privateAction)) {
          return "policyNumber";
        }
        if (
          ["פוליסת חיים", "פוליסת חיים משועבדת", "ביטוח בריאות", "ביטוח בריאות ומחלות קשות"].includes(
            a.privateProduct
          )
        ) {
          return "insuranceSum";
        }
        if (a.privateAction === "הפקה") {
          return "newPolicyDetails";
        }
        if (a.privateAction === "מינוי סוכן") {
          return mode === MODE_RECOMMENDATION ? "reasons" : advanceActionOrFinish();
        }
        return mode === MODE_RECOMMENDATION ? "reasons" : advanceActionOrFinish();

      case "policyNumber":
        if (
          ["פוליסת חיים", "פוליסת חיים משועבדת", "ביטוח בריאות", "ביטוח בריאות ומחלות קשות"].includes(
            a.privateProduct
          )
        ) {
          return "insuranceSum";
        }
        if (a.privateAction === "ביטול והפקה חדשה") {
          return "newPolicyDetails";
        }
        return mode === MODE_RECOMMENDATION ? "reasons" : advanceActionOrFinish();

      case "insuranceSum":
        if (a.privateAction === "הפקה" || a.privateAction === "ביטול והפקה חדשה") {
          return "newPolicyDetails";
        }
        return mode === MODE_RECOMMENDATION ? "reasons" : advanceActionOrFinish();

      case "newPolicyDetails":
        return mode === MODE_RECOMMENDATION ? "reasons" : advanceActionOrFinish();

      case "reasons":
        return advanceActionOrFinish();

      default:
        return null;
    }
  }
}

function advanceActionOrFinish() {
  if (currentActionIndex + 1 < totalActions) {
    currentActionIndex++;
    return "actionType";
  } else {
    showSummary();
    return null;
  }
}

// =====================
// סיכום סופי
// =====================

function showSummary() {
  const box = document.getElementById("summaryBox");
  const lines = [];

  if (mode === MODE_SUMMARY) {
    lines.push("בהמשך לשיחתנו");
    lines.push("סוכם על הדברים הבאים:");
    lines.push("");
  } else {
    lines.push("בהמשך לשיחתנו");
    lines.push("להלן ההמלצות שנאמרו בשיחה:");
    lines.push("");
  }

  actions.forEach((a, idx) => {
    if (!a || !a.type) return;

    let line = `${idx + 1}. `;

    if (a.type !== "פרט") {
      const company = formatCompanyWithOther(a.company, a.companyOther);
      const product = a.product === "אחר" ? a.productOther : a.product;
      let empPart = "";
      if (["קרן פנסיה", "קרן השתלמות", "קופת גמל"].includes(product)) {
        if (a.employmentType === "שכירה") {
          empPart = a.employerName
            ? ` שכירה תחת המעסיק ${a.employerName}`
            : " שכירה בלבד";
        } else if (a.employmentType === "עצמאית") {
          empPart = a.selfDeposit
            ? ` עצמאית עם הפקדה חודשית של ${a.selfDeposit} ₪`
            : " עצמאית";
        }
      }

      if (a.type === "פתיחת קופה") {
        let track =
          a.openTrack === "אחר" ? a.openTrackOther : a.openTrack;
        track = formatTrack(track);
        const mgmt =
          a.managementFee === "אחר"
            ? a.managementFeeOther
            : a.managementFee;
        line += `פתיחת ${product} בחברת ${company}${empPart} כאשר הכסף יושקע במסלול השקעה ${track} בדמי ניהול ${mgmt}.`;
      } else if (a.type === "ניוד") {
        const target = formatCompanyWithOther(
          a.targetCompany,
          a.targetCompanyOther
        );
        let track =
          a.openTrack === "אחר" ? a.openTrackOther : a.openTrack;
        track = formatTrack(track);
        const mgmt =
          a.managementFee === "אחר"
            ? a.managementFeeOther
            : a.managementFee;
        line += `${company} ${product} מספר קופה ${a.accountNumber}- תנויד לחברת ${target} כאשר הכסף יושקע במסלול השקעה ${track} בדמי ניהול ${mgmt}.`;
      } else if (a.type === "השארה") {
        const mgmt =
          a.managementFee === "אחר"
            ? a.managementFeeOther
            : a.managementFee;
        if (a.keepType === "ללא שינוי") {
          line += `${company} ${product} מספר קופה ${a.accountNumber}- תישאר ללא שינוי בדמי ניהול ${mgmt}.`;
        } else if (a.keepType === "שינוי מסלול השקעה") {
          let cur =
            a.currentTrack === "אחר"
              ? a.currentTrackOther
              : a.currentTrack;
          let n =
            a.newTrack === "אחר" ? a.newTrackOther : a.newTrack;
          cur = formatTrack(cur);
          n = formatTrack(n);
          // פורמט 3 – כל אחד בשורה נפרדת
          line += `${company} ${product} מספר קופה ${a.accountNumber}- תישאר באותה חברה.`;
          line += `\nמסלול נוכחי: ${cur}`;
          line += `\nמסלול חדש: ${n}`;
          line += `\nדמי ניהול: ${mgmt}.`;
        } else if (a.keepType === "מינוי סוכן") {
          line += `${company} ${product} מספר קופה ${a.accountNumber}- יתבצע מינוי סוכן בדמי ניהול ${mgmt}.`;
        }
      }

      if (product === "קופת גמל להשקעה") {
        if (a.kgiDepositType && a.kgiDepositType !== "ללא הפקדה") {
          let dep = "";
          if (
            a.kgiDepositType === "הוראת קבע" ||
            a.kgiDepositType === "גם וגם"
          ) {
            dep += ` עם הוראת קבע של ${a.kgiMonthly} ₪`;
          }
          if (
            a.kgiDepositType === "חד פעמי" ||
            a.kgiDepositType === "גם וגם"
          ) {
            dep +=
              (dep ? " וגם" : " עם") +
              ` הפקדה חד פעמית של ${a.kgiOneTime} ₪`;
          }
          line += dep;
        }
      }
    } else {
      // ----- פרט / ביטוח -----
      const company = formatCompanyWithOther(
        a.privateCompany,
        a.privateCompanyOther
      );
      const product =
        a.privateProduct === "אחר"
          ? a.privateProductOther
          : a.privateProduct;

      if (a.privateAction === "ביטול") {
        line += `${product} בחברת ${company} מספר פוליסה ${a.policyNumber}- תבוטל.`;
      } else if (a.privateAction === "השארה") {
        line += `${product} בחברת ${company} מספר פוליסה ${a.policyNumber}- תישאר ללא שינוי.`;
      } else if (a.privateAction === "מינוי סוכן") {
        line += `${product} בחברת ${company} מספר פוליסה ${a.policyNumber}- יתבצע מינוי סוכן.`;
      } else if (a.privateAction === "הפקה") {
        let newType =
          a.newPolicyType === "אחר"
            ? a.newPolicyTypeOther
            : a.newPolicyType || product;
        let newComp = formatCompanyWithOther(
          a.newPolicyCompany,
          a.newPolicyCompanyOther
        );
        let sumPart = "";
        if (
          ["פוליסת חיים", "פוליסת חיים משועבדת", "ביטוח בריאות", "ביטוח בריאות ומחלות קשות"].includes(
            product
          ) && a.insuranceSum
        ) {
          sumPart = ` עם פיצוי של ${a.insuranceSum} ₪`;
        }
        line += `תופק פוליסה חדשה של ${newType}${sumPart} בחברת ${newComp} בפרמיה חודשית של ${a.newPolicyPremium} ₪.`;
      } else if (a.privateAction === "ביטול והפקה חדשה") {
        let newType =
          a.newPolicyType === "אחר"
            ? a.newPolicyTypeOther
            : a.newPolicyType;
        let newComp = formatCompanyWithOther(
          a.newPolicyCompany,
          a.newPolicyCompanyOther
        );
        let sumPart = "";
        if (
          ["פוליסת חיים", "פוליסת חיים משועבדת", "ביטוח בריאות", "ביטוח בריאות ומחלות קשות"].includes(
            product
          ) && a.insuranceSum
        ) {
          sumPart = ` עם פיצוי של ${a.insuranceSum} ₪`;
        }
        line += `${product} בחברת ${company} מספר פוליסה ${a.policyNumber}- פוליסה זו תתבטל ובמקום זה תופק פוליסת ${newType}${sumPart} ב${newComp} בפרמיה חודשית של ${a.newPolicyPremium} ₪.`;
      }
    }

    // נימוקים (במצב המלצות)
    if (mode === MODE_RECOMMENDATION && a.reasons && a.reasons.length) {
      line += "\nלהלן הסיבות להמלצה זאת:\n";
      if (a.reasons.length === 1) {
        line += a.reasons[0];
      } else {
        a.reasons.forEach((r, i) => {
          const letter = HEBREW_LETTERS[i] || "";
          line += `${letter}. ${r}\n`;
        });
        line = line.trimEnd();
      }
    }

    lines.push(line);
    lines.push("");
  });

  box.textContent = lines.join("\n").trim();
  box.classList.remove("hidden");
}

// =====================
// ניווט
// =====================

document.getElementById("nextBtn").addEventListener("click", () => {
  if (!saveCurrentStep()) return;
  history.push(currentStep);
  const next = computeNextStep();
  if (next) {
    currentStep = next;
    render();
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  if (!history.length) return;
  currentStep = history.pop();
  render();
});

// התחלה
render();

