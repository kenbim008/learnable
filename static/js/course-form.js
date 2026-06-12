document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("id_category");
    const subcategorySelect = document.getElementById("id_subcategory");
    const categories = window.LEARNIBLE_CATEGORIES || {};

    function refreshSubcategories() {
        if (!categorySelect || !subcategorySelect) return;
        const cat = categorySelect.value;
        const current = subcategorySelect.value;
        subcategorySelect.innerHTML = "";
        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "Select subcategory";
        subcategorySelect.appendChild(blank);
        const subs = categories[cat]?.subcategories || {};
        Object.entries(subs).forEach(([key, label]) => {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = label;
            if (key === current) opt.selected = true;
            subcategorySelect.appendChild(opt);
        });
    }

    categorySelect?.addEventListener("change", refreshSubcategories);

    const addBtn = document.getElementById("addModuleBtn");
    const formset = document.getElementById("moduleFormset");
    const totalForms = document.getElementById("id_modules-TOTAL_FORMS");

    addBtn?.addEventListener("click", () => {
        if (!formset || !totalForms) return;
        const index = parseInt(totalForms.value, 10);
        const template = formset.querySelector(".module-form-row");
        if (!template) return;
        const clone = template.cloneNode(true);
        clone.querySelectorAll("input, textarea, select").forEach((el) => {
            if (el.name) {
                el.name = el.name.replace(/modules-\d+-/, `modules-${index}-`);
                el.id = el.id.replace(/modules-\d+-/, `modules-${index}-`);
            }
            if (el.type === "checkbox") {
                el.checked = false;
            } else if (el.type === "file") {
                el.value = "";
            } else {
                el.value = el.type === "number" ? String(index) : "";
            }
        });
        clone.querySelectorAll("label[for]").forEach((label) => {
            const f = label.getAttribute("for");
            if (f) label.setAttribute("for", f.replace(/modules-\d+-/, `modules-${index}-`));
        });
        const deleteInput = clone.querySelector('input[name$="-DELETE"]');
        if (deleteInput) deleteInput.checked = false;
        const idInput = clone.querySelector('input[name$="-id"]');
        if (idInput) idInput.remove();
        formset.appendChild(clone);
        totalForms.value = String(index + 1);
    });
});
