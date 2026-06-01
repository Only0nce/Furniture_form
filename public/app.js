"use strict";

/* Config section */
const CONFIG = {
  // Public Google Apps Script Web App URL. Keep spreadsheet IDs, sheet names,
  // credentials, and row mapping inside Apps Script, never in this file.
  SUBMIT_ENDPOINT: "https://script.google.com/macros/s/AKfycbwE-4ztZy39OS86U6emWKAp2puhCVFkgtf-x0AOh5KM938U9G0JcufTS77ZnsbwLKIoQQ/exec",
  STORAGE_KEYS: {
    language: "furnitureLeadForm.language",
    theme: "furnitureLeadForm.theme",
  },
  DEFAULT_LANGUAGE: "en",
  DEFAULT_THEME: "light",
};

// Field configuration keeps validation and payload creation easy to update.
const FIELD_CONFIG = {
  required: ["name", "phone"],
  optional: ["email", "address", "interestedProduct", "budget", "message"],
};

/* Company information */
// Edit company details here once. The UI renders these values in the header,
// contact section, and footer so the information stays consistent.
const companyInfo = {
  th: {
    brandName: "เนสท์ โมเดิร์น ดีไซน์",
    legalName: "ห้างหุ้นส่วนจำกัด เนสท์ โมเดิร์น ดีไซน์ (สำนักงานใหญ่)",
    companyName: "Nest Modern Design Ltd., Part.",
    address: "เลขที่ 22 หมู่ 6 ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40000",
    taxId: "043004142, 0624134924",
    email: "qu.acc66@gmail.com",
  },
  en: {
    brandName: "Nest Modern Design Ltd., Part.",
    legalName: "Nest Modern Design Ltd., Part. (Head Office)",
    companyName: "Nest Modern Design Ltd., Part.",
    address: "No. 22, Moo 6, Nai Mueang Subdistrict, Mueang Khon Kaen District, Khon Kaen Province 40000, Thailand",
    taxId: "043004142, 0624134924",
    email: "qu.acc66@gmail.com",
  },
  zh: {
    brandName: "Nest Modern Design Ltd., Part.",
    legalName: "Nest Modern Design Ltd., Part. (Head Office)",
    companyName: "Nest Modern Design Ltd., Part.",
    address: "No. 22, Moo 6, Nai Mueang Subdistrict, Mueang Khon Kaen District, Khon Kaen Province 40000, Thailand",
    taxId: "043004142, 0624134924",
    email: "qu.acc66@gmail.com",
  },
};

/* Translation data */
// Add future languages by creating a new language key with the same structure.
const translations = {
  en: {
    documentTitle: "Furniture Customer Inquiry",
    skipToForm: "Skip to form",
    languageLabel: "Language",
    themeToggle: "Dark mode",
    themeToggleLight: "Light mode",
    eyebrow: "Furniture consultation request",
    heroTitle: "Design a warmer, better-fitted home with our furniture team.",
    heroSubtitle: "Share your contact details and the furniture you are interested in. Our team will contact you with product guidance, custom options, and delivery support.",
    heroImageAlt: "Warm modern furniture showroom with sofa, wood table, shelves, and home decor",
    benefitConsultTitle: "Free consultation",
    benefitConsultText: "Get help choosing furniture that fits your room, style, and budget.",
    benefitCustomTitle: "Custom furniture",
    benefitCustomText: "Request custom sizes, materials, colors, and room-specific solutions.",
    benefitDeliveryTitle: "Delivery support",
    benefitDeliveryText: "Ask about delivery, installation, and follow-up service for your order.",
    formEyebrow: "Customer details",
    formTitle: "Tell us what you need",
    formIntro: "Name, phone number, and consent are required. Email and address are optional.",
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    phoneLabel: "Phone number",
    phonePlaceholder: "08X XXX XXXX",
    addressLabel: "Address",
    addressPlaceholder: "Delivery address or project location",
    productLabel: "Interested product",
    budgetLabel: "Estimated budget",
    messageLabel: "Additional message",
    messagePlaceholder: "Tell us about sizes, colors, materials, or preferred contact time",
    consentText: "I agree to be contacted about products and services related to this furniture inquiry.",
    privacyNote: "Your information is used only for customer contact and furniture inquiry follow-up.",
    submitButton: "Send inquiry",
    loadingMessage: "Sending your inquiry...",
    successMessage: "Thank you. Your inquiry has been sent and our team will contact you soon.",
    errorMessage: "Unable to save submission. Please try again.",
    brandEyebrow: "Personalized support",
    brandTitle: "From first measurement to final placement.",
    brandText: "Whether you need a sofa, dining table, wardrobe, cabinet, shelf, decor piece, or a custom-built solution, our team will help you move from idea to practical next step.",
    contactEyebrow: "Official contact",
    contactTitle: "Contact our furniture team",
    contactText: "For product questions, custom furniture details, or follow-up on this form, please use our official company email.",
    emailContactLabel: "Email",
    contactCardText: "Official company contact channel",
    footerEyebrow: "Company information",
    footerText: "Customer data is used only for furniture inquiry follow-up by our company team.",
    footerCta: "Back to form",
    taxLabel: "Tel",
    selectProductPlaceholder: "Select a product",
    selectBudgetPlaceholder: "Select a budget",
    products: {
      sofa: "Sofa",
      chair: "Chair",
      table: "Table",
      bed: "Bed",
      wardrobe: "Wardrobe",
      cabinet: "Cabinet",
      shelf: "Shelf",
      decor: "Home decoration",
      custom: "Custom furniture",
      other: "Other",
    },
    budgets: {
      under20000: "Under 20,000 THB",
      range20000to50000: "20,000 - 50,000 THB",
      range50000to100000: "50,000 - 100,000 THB",
      over100000: "Over 100,000 THB",
      discuss: "Need consultation",
    },
    validation: {
      required: "This field is required.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number.",
      consent: "Please confirm your consent before submitting.",
    },
  },
  th: {
    documentTitle: "แบบฟอร์มสอบถามข้อมูลเฟอร์นิเจอร์",
    skipToForm: "ข้ามไปยังแบบฟอร์ม",
    languageLabel: "ภาษา",
    themeToggle: "โหมดมืด",
    themeToggleLight: "โหมดสว่าง",
    eyebrow: "ขอรับคำปรึกษาเรื่องเฟอร์นิเจอร์",
    heroTitle: "แต่งบ้านให้อบอุ่นและพอดีกับพื้นที่ ด้วยทีมเฟอร์นิเจอร์ของเรา",
    heroSubtitle: "ฝากข้อมูลติดต่อและสินค้าที่สนใจ ทีมงานจะติดต่อกลับพร้อมคำแนะนำสินค้า ตัวเลือกสั่งทำ และบริการจัดส่ง",
    heroImageAlt: "โชว์รูมเฟอร์นิเจอร์สไตล์โมเดิร์นที่มีโซฟา โต๊ะไม้ ชั้นวาง และของตกแต่งบ้าน",
    benefitConsultTitle: "ให้คำปรึกษาฟรี",
    benefitConsultText: "ช่วยเลือกเฟอร์นิเจอร์ให้เหมาะกับพื้นที่ สไตล์ และงบประมาณของคุณ",
    benefitCustomTitle: "เฟอร์นิเจอร์สั่งทำ",
    benefitCustomText: "สอบถามขนาด วัสดุ สี และงานออกแบบเฉพาะพื้นที่ได้",
    benefitDeliveryTitle: "บริการจัดส่ง",
    benefitDeliveryText: "สอบถามการจัดส่ง ติดตั้ง และบริการหลังการขายสำหรับคำสั่งซื้อของคุณ",
    formEyebrow: "ข้อมูลลูกค้า",
    formTitle: "แจ้งสิ่งที่คุณต้องการ",
    formIntro: "ต้องกรอกชื่อ เบอร์โทรศัพท์ และยืนยันความยินยอม ส่วนอีเมลและที่อยู่ไม่บังคับ",
    nameLabel: "ชื่อ",
    namePlaceholder: "ชื่อและนามสกุล",
    emailLabel: "อีเมล",
    emailPlaceholder: "name@example.com",
    phoneLabel: "เบอร์โทรศัพท์",
    phonePlaceholder: "08X XXX XXXX",
    addressLabel: "ที่อยู่",
    addressPlaceholder: "ที่อยู่สำหรับจัดส่งหรือสถานที่ติดตั้ง",
    productLabel: "สินค้าที่สนใจ",
    budgetLabel: "งบประมาณโดยประมาณ",
    messageLabel: "ข้อความเพิ่มเติม",
    messagePlaceholder: "แจ้งขนาด สี วัสดุ หรือเวลาที่สะดวกให้ติดต่อกลับ",
    consentText: "ฉันยินยอมให้ติดต่อกลับเกี่ยวกับสินค้าและบริการที่เกี่ยวข้องกับคำถามเรื่องเฟอร์นิเจอร์นี้",
    privacyNote: "ข้อมูลของคุณจะใช้เพื่อการติดต่อและติดตามคำถามเรื่องเฟอร์นิเจอร์เท่านั้น",
    submitButton: "ส่งข้อมูล",
    loadingMessage: "กำลังส่งข้อมูลของคุณ...",
    successMessage: "ขอบคุณ ข้อมูลของคุณถูกส่งแล้ว ทีมงานจะติดต่อกลับเร็ว ๆ นี้",
    errorMessage: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง",
    brandEyebrow: "บริการที่เหมาะกับคุณ",
    brandTitle: "ตั้งแต่วัดพื้นที่ครั้งแรกจนถึงจัดวางหน้างาน",
    brandText: "ไม่ว่าคุณกำลังมองหาโซฟา โต๊ะอาหาร ตู้เสื้อผ้า ตู้เก็บของ ชั้นวาง ของตกแต่ง หรืองานสั่งทำ ทีมงานของเราจะช่วยเปลี่ยนไอเดียให้เป็นขั้นตอนถัดไปที่ชัดเจน",
    contactEyebrow: "ช่องทางติดต่ออย่างเป็นทางการ",
    contactTitle: "ติดต่อทีมเฟอร์นิเจอร์ของเรา",
    contactText: "สำหรับคำถามเกี่ยวกับสินค้า รายละเอียดงานสั่งทำ หรือการติดตามแบบฟอร์ม กรุณาติดต่อผ่านอีเมลบริษัทอย่างเป็นทางการ",
    emailContactLabel: "อีเมล",
    contactCardText: "ช่องทางติดต่อบริษัทอย่างเป็นทางการ",
    footerEyebrow: "ข้อมูลบริษัท",
    footerText: "ข้อมูลลูกค้าใช้เพื่อติดตามคำถามเรื่องเฟอร์นิเจอร์โดยทีมงานบริษัทเท่านั้น",
    footerCta: "กลับไปที่แบบฟอร์ม",
    taxLabel: "เบอร์โทรศัพท์",
    selectProductPlaceholder: "เลือกสินค้า",
    selectBudgetPlaceholder: "เลือกงบประมาณ",
    products: {
      sofa: "โซฟา",
      chair: "เก้าอี้",
      table: "โต๊ะ",
      bed: "เตียง",
      wardrobe: "ตู้เสื้อผ้า",
      cabinet: "ตู้เก็บของ",
      shelf: "ชั้นวาง",
      decor: "ของตกแต่งบ้าน",
      custom: "เฟอร์นิเจอร์สั่งทำ",
      other: "อื่น ๆ",
    },
    budgets: {
      under20000: "ต่ำกว่า 20,000 บาท",
      range20000to50000: "20,000 - 50,000 บาท",
      range50000to100000: "50,000 - 100,000 บาท",
      over100000: "มากกว่า 100,000 บาท",
      discuss: "ต้องการปรึกษางบประมาณ",
    },
    validation: {
      required: "กรุณากรอกข้อมูลช่องนี้",
      email: "กรุณากรอกอีเมลให้ถูกต้อง",
      phone: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง",
      consent: "กรุณายืนยันความยินยอมก่อนส่งข้อมูล",
    },
  },
  zh: {
    documentTitle: "家具客户咨询表",
    skipToForm: "跳至表单",
    languageLabel: "语言",
    themeToggle: "深色模式",
    themeToggleLight: "浅色模式",
    eyebrow: "家具咨询申请",
    heroTitle: "让我们的家具团队为你打造更温暖、更合适的家",
    heroSubtitle: "请留下联系方式和感兴趣的家具。我们的团队会联系你，提供产品建议、定制选择和配送支持。",
    heroImageAlt: "温暖现代的家具展厅，包含沙发、木桌、置物架和家居装饰",
    benefitConsultTitle: "免费咨询",
    benefitConsultText: "帮助你根据空间、风格和预算选择合适的家具。",
    benefitCustomTitle: "定制家具",
    benefitCustomText: "可咨询定制尺寸、材质、颜色和空间解决方案。",
    benefitDeliveryTitle: "配送支持",
    benefitDeliveryText: "可咨询订单配送、安装和后续服务。",
    formEyebrow: "客户资料",
    formTitle: "告诉我们你的需求",
    formIntro: "姓名、电话号码和同意确认为必填。电子邮件和地址为选填。",
    nameLabel: "姓名",
    namePlaceholder: "你的全名",
    emailLabel: "电子邮件",
    emailPlaceholder: "name@example.com",
    phoneLabel: "电话号码",
    phonePlaceholder: "08X XXX XXXX",
    addressLabel: "地址",
    addressPlaceholder: "配送地址或项目地点",
    productLabel: "感兴趣的产品",
    budgetLabel: "预计预算",
    messageLabel: "补充信息",
    messagePlaceholder: "请告诉我们尺寸、颜色、材质或方便联系的时间",
    consentText: "我同意接收与本次家具咨询相关的产品和服务联系。",
    privacyNote: "你的资料仅用于客户联系和家具咨询跟进。",
    submitButton: "发送咨询",
    loadingMessage: "正在发送你的咨询...",
    successMessage: "谢谢。你的咨询已发送，我们的团队会尽快联系你。",
    errorMessage: "无法保存提交内容。请重试。",
    brandEyebrow: "个性化支持",
    brandTitle: "从第一次测量到最终摆放。",
    brandText: "无论你需要沙发、餐桌、衣柜、柜子、置物架、装饰品，还是定制家具方案，我们的团队都会帮助你把想法推进到清晰的下一步。",
    contactEyebrow: "官方联系方式",
    contactTitle: "联系家具团队",
    contactText: "如需咨询产品、定制家具细节或跟进此表单，请使用公司官方电子邮件。",
    emailContactLabel: "电子邮件",
    contactCardText: "公司官方联系渠道",
    footerEyebrow: "公司信息",
    footerText: "客户资料仅由公司团队用于家具咨询跟进。",
    footerCta: "返回表单",
    taxLabel: "电话号码",
    selectProductPlaceholder: "选择产品",
    selectBudgetPlaceholder: "选择预算",
    products: {
      sofa: "沙发",
      chair: "椅子",
      table: "桌子",
      bed: "床",
      wardrobe: "衣柜",
      cabinet: "柜子",
      shelf: "置物架",
      decor: "家居装饰",
      custom: "定制家具",
      other: "其他",
    },
    budgets: {
      under20000: "20,000 泰铢以下",
      range20000to50000: "20,000 - 50,000 泰铢",
      range50000to100000: "50,000 - 100,000 泰铢",
      over100000: "100,000 泰铢以上",
      discuss: "需要预算咨询",
    },
    validation: {
      required: "此字段为必填。",
      email: "请输入有效的电子邮件地址。",
      phone: "请输入有效的电话号码。",
      consent: "提交前请确认你的同意。",
    },
  },
};

const productOptions = [
  { value: "", labelKey: "selectProductPlaceholder" },
  { value: "Sofa", labelKey: "products.sofa" },
  { value: "Chair", labelKey: "products.chair" },
  { value: "Table", labelKey: "products.table" },
  { value: "Bed", labelKey: "products.bed" },
  { value: "Wardrobe", labelKey: "products.wardrobe" },
  { value: "Cabinet", labelKey: "products.cabinet" },
  { value: "Shelf", labelKey: "products.shelf" },
  { value: "Home decoration", labelKey: "products.decor" },
  { value: "Custom furniture", labelKey: "products.custom" },
  { value: "Other", labelKey: "products.other" },
];

const budgetOptions = [
  { value: "", labelKey: "selectBudgetPlaceholder" },
  { value: "Under 20,000 THB", labelKey: "budgets.under20000" },
  { value: "20,000 - 50,000 THB", labelKey: "budgets.range20000to50000" },
  { value: "50,000 - 100,000 THB", labelKey: "budgets.range50000to100000" },
  { value: "Over 100,000 THB", labelKey: "budgets.over100000" },
  { value: "Need consultation", labelKey: "budgets.discuss" },
];

/* DOM element references */
const dom = {
  root: document.documentElement,
  languageSelect: document.getElementById("language-select"),
  themeToggle: document.getElementById("theme-toggle"),
  form: document.getElementById("lead-form"),
  submitButton: document.getElementById("submit-button"),
  formStatus: document.getElementById("form-status"),
  productSelect: document.getElementById("interestedProduct"),
  budgetSelect: document.getElementById("budget"),
};

let currentLanguage = CONFIG.DEFAULT_LANGUAGE;
let isSubmitting = false;

/* Initialization */
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  currentLanguage = getStoredLanguage();
  const savedTheme = getStoredTheme();

  dom.languageSelect.value = currentLanguage;
  setFormStartedAt();
  applyLanguage(currentLanguage);
  applyTheme(savedTheme);
  attachEventListeners();
}

function setFormStartedAt() {
  const startedInput = document.getElementById("formStartedAt");
  if (startedInput) {
    startedInput.value = String(Date.now());
  }
}

/* Language handling */
function getStoredLanguage() {
  const savedLanguage = localStorage.getItem(CONFIG.STORAGE_KEYS.language);
  return translations[savedLanguage] ? savedLanguage : CONFIG.DEFAULT_LANGUAGE;
}

function applyLanguage(language) {
  currentLanguage = translations[language] ? language : CONFIG.DEFAULT_LANGUAGE;
  localStorage.setItem(CONFIG.STORAGE_KEYS.language, currentLanguage);
  dom.root.lang = currentLanguage === "zh" ? "zh-CN" : currentLanguage;
  document.title = `${getCompanyInfo().brandName} | ${t("documentTitle")}`;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.alt = t(element.dataset.i18nAlt);
  });

  renderCompanyInfo();
  populateSelect(dom.productSelect, productOptions);
  populateSelect(dom.budgetSelect, budgetOptions);
  refreshThemeToggleText();
  clearValidationErrors();
}

function renderCompanyInfo() {
  const info = getCompanyInfo();

  document.querySelectorAll("[data-company]").forEach((element) => {
    const key = element.dataset.company;
    element.textContent = info[key] || "";
  });

  document.querySelectorAll("[data-company-email]").forEach((element) => {
    element.textContent = info.email;
  });

  document.querySelectorAll("[data-company-email-link]").forEach((element) => {
    element.href = `mailto:${info.email}`;
  });
}

function getCompanyInfo() {
  return companyInfo[currentLanguage] || companyInfo[CONFIG.DEFAULT_LANGUAGE];
}

function populateSelect(selectElement, options) {
  const selectedValue = selectElement.value;
  selectElement.innerHTML = "";

  options.forEach((optionData) => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = t(optionData.labelKey);
    selectElement.append(option);
  });

  selectElement.value = options.some((option) => option.value === selectedValue) ? selectedValue : "";
}

function t(key) {
  return getNestedValue(translations[currentLanguage], key) || getNestedValue(translations[CONFIG.DEFAULT_LANGUAGE], key) || key;
}

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), source);
}

/* Theme handling */
function getStoredTheme() {
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return CONFIG.DEFAULT_THEME;
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  dom.root.dataset.theme = nextTheme;
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, nextTheme);
  dom.themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
  refreshThemeToggleText();
}

function refreshThemeToggleText() {
  const label = dom.themeToggle.querySelector("[data-i18n='themeToggle']");
  const isDark = dom.root.dataset.theme === "dark";
  label.textContent = isDark ? t("themeToggleLight") : t("themeToggle");
}

function toggleTheme() {
  applyTheme(dom.root.dataset.theme === "dark" ? "light" : "dark");
}

/* Form validation */
function validateForm() {
  clearValidationErrors();

  const formData = new FormData(dom.form);
  let isValid = true;

  FIELD_CONFIG.required.forEach((fieldName) => {
    const field = dom.form.elements[fieldName];
    if (!String(formData.get(fieldName) || "").trim()) {
      setFieldError(field, t("validation.required"));
      isValid = false;
    }
  });

  const emailField = dom.form.elements.email;
  const emailValue = String(formData.get("email") || "").trim();
  if (emailValue && !isValidEmail(emailValue)) {
    setFieldError(emailField, t("validation.email"));
    isValid = false;
  }

  const phoneField = dom.form.elements.phone;
  const phoneValue = String(formData.get("phone") || "").trim();
  if (phoneValue && !isValidPhone(phoneValue)) {
    setFieldError(phoneField, t("validation.phone"));
    isValid = false;
  }

  const consentField = dom.form.elements.consent;
  if (!consentField.checked) {
    setFieldError(consentField, t("validation.consent"));
    isValid = false;
  }

  if (!isValid) {
    focusFirstInvalidField();
  }

  return isValid;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+\-()\s]{7,20}$/.test(value);
}

function setFieldError(field, message) {
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");

  const errorElement = document.getElementById(`${field.id}-error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearValidationErrors() {
  dom.form.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  });

  dom.form.querySelectorAll(".field-error").forEach((errorElement) => {
    errorElement.textContent = "";
  });
}

function focusFirstInvalidField() {
  const invalidField = dom.form.querySelector(".is-invalid");
  if (invalidField) {
    invalidField.focus({ preventScroll: false });
  }
}

/* Payload creation */
function createPayload() {
  const formData = new FormData(dom.form);

  return {
    language: currentLanguage,
    name: cleanValue(formData.get("name")),
    phone: cleanValue(formData.get("phone")),
    email: cleanValue(formData.get("email")),
    address: cleanValue(formData.get("address")),
    interestedProduct: cleanValue(formData.get("interestedProduct")),
    budget: cleanValue(formData.get("budget")),
    message: cleanValue(formData.get("message")),
    consent: dom.form.elements.consent.checked,
    website: cleanValue(formData.get("website")),
    formStartedAt: cleanValue(formData.get("formStartedAt")),
    userAgent: navigator.userAgent,
    source: window.location.href,
  };
}

function cleanValue(value) {
  return String(value || "").trim();
}

/* Lead submission */
async function submitLead(payload) {
  const response = await fetch(CONFIG.SUBMIT_ENDPOINT, {
    method: "POST",
    headers: {
      // Apps Script Web Apps do not handle browser CORS preflight requests.
      // The body is still JSON; text/plain keeps this request simple.
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || t("errorMessage"));
  }

  return result;
}

/* UI state helpers */
function setSubmittingState(nextIsSubmitting) {
  isSubmitting = nextIsSubmitting;
  dom.submitButton.disabled = nextIsSubmitting;
  dom.submitButton.classList.toggle("is-loading", nextIsSubmitting);
  dom.submitButton.querySelector(".button-label").textContent = nextIsSubmitting ? t("loadingMessage") : t("submitButton");
}

function setFormStatus(message, type) {
  dom.formStatus.textContent = message;
  dom.formStatus.className = "form-status";

  if (type) {
    dom.formStatus.classList.add(`is-${type}`);
  }
}

function resetFormAfterSuccess() {
  dom.form.reset();
  setFormStartedAt();
  populateSelect(dom.productSelect, productOptions);
  populateSelect(dom.budgetSelect, budgetOptions);
}

/* Success / error handling */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  setFormStatus("", "");

  if (!validateForm()) {
    return;
  }

  const payload = createPayload();
  setSubmittingState(true);
  setFormStatus(t("loadingMessage"), "");

  try {
    await submitLead(payload);
    setFormStatus(t("successMessage"), "success");
    resetFormAfterSuccess();
  } catch (error) {
    setFormStatus(error.message || t("errorMessage"), "error");
  } finally {
    setSubmittingState(false);
  }
}

/* Event listeners */
function attachEventListeners() {
  dom.languageSelect.addEventListener("change", (event) => {
    applyLanguage(event.target.value);
    setFormStatus("", "");
  });

  dom.themeToggle.addEventListener("click", toggleTheme);
  dom.form.addEventListener("submit", handleFormSubmit);

  dom.form.addEventListener("input", clearFieldErrorOnChange);
  dom.form.addEventListener("change", clearFieldErrorOnChange);
}

function clearFieldErrorOnChange(event) {
  if (!event.target.classList.contains("is-invalid")) {
    return;
  }

  event.target.classList.remove("is-invalid");
  event.target.removeAttribute("aria-invalid");

  const errorElement = document.getElementById(`${event.target.id}-error`);
  if (errorElement) {
    errorElement.textContent = "";
  }
}
