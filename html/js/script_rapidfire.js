/* =========================
   LOAD RAPID FIRE SECTION
========================= */
function loadRapidfireSection() {

    const itemList = document.getElementById("itemList");

    if (!itemList) return;

    itemList.innerHTML = "<li>Loading Rapid Fire...</li>";

    fetch("get_item.php?section=rapidfire&file=list.json")
        .then(res => res.json())
        .then(data => {

            if (!Array.isArray(data)) {
                itemList.innerHTML = "<li>Invalid Rapid Fire data</li>";
                return;
            }

            itemList.innerHTML = "";

            const groups = {};

            data.forEach(item => {

                if (!item.file || !item.name || !item.category) {
                    console.warn("Invalid Rapid Fire item:", item);
                    return;
                }

                if (!groups[item.category]) {
                    groups[item.category] = [];
                }

                groups[item.category].push(item);

            });

            // Create category sections
            for (const category in groups) {

                // Main container
                const wrapper = document.createElement("div");
                wrapper.className = "category";

                // Clickable heading
                const heading = document.createElement("div");
                heading.className = "category-heading";
                heading.innerHTML = "▶ " + category;

                // Rapid Fire list
                const list = document.createElement("ul");
                list.className = "category-items";
                list.style.display = "none";

                groups[category].forEach(item => {

                    const li = document.createElement("li");
                    li.className = "category-item";

                    li.innerHTML = `
                        <span class="item-icon">⚡ </span>
                        ${item.name}
                    `;

                    li.onclick = function () {
                        openItem("rapidfire", item.file);
                    };

                    list.appendChild(li);

                });


                heading.onclick = function () {

                    if (list.style.display === "none") {

                        list.style.display = "block";
                        heading.innerHTML = "▼ " + category;

                    } else {

                        list.style.display = "none";
                        heading.innerHTML = "▶ " + category;

                    }

                };

                wrapper.appendChild(heading);
                wrapper.appendChild(list);

                itemList.appendChild(wrapper);

            }

        })
        .catch(err => {

            console.error("Rapid Fire load error:", err);

            itemList.innerHTML =
                "<li style='color:red;'>Error loading Rapid Fire</li>";

        });

}

/* RENDER QUESTIONS (READ ONLY) */
function renderRapidfireQuestions() {

    const data = AppState.currentRapidfireState?.data;

    if (!data) {
        console.error("Rapidfire data missing");
        return;
    }

    console.log("Rapidfire data:", data);
    console.log("Sections:", data.sections);
    console.log("Sections length:", data.sections?.length);

    let html = `
    <div style="
        max-width:1000px;
        margin:auto;
        padding:25px;
        font-family:Arial,Helvetica,sans-serif;
    ">

        <div style="
            background:linear-gradient(90deg,#1e3a8a,#2563eb);
            color:white;
            padding:20px;
            border-radius:10px;
            margin-bottom:25px;
            box-shadow:0 3px 10px rgba(0,0,0,.25);
        ">

            <h1 style="margin:0;">
                ${data.title}
            </h1>

            <p style="
                margin-top:8px;
                font-size:16px;
                opacity:.95;
            ">
                ${data.description}
            </p>

        </div>
    `;

    const colors = [
        "#2563eb",
        "#16a34a",
        "#ea580c",
        "#7c3aed",
        "#dc2626",
        "#0891b2"
    ];
    console.log("Sections:", data.sections);
    (data.sections || []).forEach((section, secIndex) => {
        console.log("Section:", secIndex, section.title);
        let color = colors[secIndex % colors.length];

        let sectionId = "section_" + secIndex;

        html += `

        <div style="background:white;margin-bottom:18px;border-radius:10px;overflow:hidden;box-shadow:0 3px 8px rgba(0,0,0,.15);">

        <div
        onclick="toggleSection('${sectionId}')"
        style=" background:${color};color:white;padding:16px 20px;cursor:pointer;transition:all .25s ease;display:flex;justify-content:space-between;
        align-items:center;font-size:21px;font-weight:bold;
        "
        onmouseover="this.style.filter='brightness(110%)'"
        onmouseout="this.style.filter='brightness(100%)'"
        >
        <div>

        <span
            id="${sectionId}_icon"
            class="rapidfire-icon"
            style="
                display:inline-block;
                margin-right:12px;
                font-size:18px;
                transition:transform .35s ease;
            ">
            ▶
        </span>

        ${section.title}

        </div>

        <div
        style="background:white;color:${color};padding:4px 12px;border-radius:20px;font-size:14px;font-weight:bold;">

        ${section.questions.length} Questions

        </div>

        </div>

        <div id="${sectionId}"
        style="max-height:0;overflow:hidden;padding-left:20px;padding-right:20px;padding-top:0;padding-bottom:0;background:#ffffff;
        transition:max-height .45s ease,padding .35s ease;"
        class="rapidfire-body"
        >
        `;

        section.questions.forEach(q => {

            html += `

            <div style="
                background:#f8fafc;
                border-left:6px solid ${color};
                border-radius:8px;
                padding:15px;
                margin-bottom:12px;
                transition:.2s;
            ">

                <div style="
                    display:inline-block;
                    background:${color};
                    color:white;
                    padding:5px 10px;
                    border-radius:20px;
                    font-size:13px;
                    margin-bottom:10px;
                ">
                    Question ${q.question_number}
                </div>

                <div style="
                    font-size:17px;
                    color:#1e293b;
                ">
                    ${q.question}
                </div>

            </div>
            `;

        });

        html += `
            </div>
        </div>
        `;
    });

    html += `

        <div style="
            background:#16a34a;
            color:white;
            text-align:center;
            padding:20px;
            border-radius:10px;
            margin-top:30px;
            box-shadow:0 3px 10px rgba(0,0,0,.2);
        ">

            <h2 style="margin:0;">
                🎉 Great Job!
            </h2>

            <p style="margin-top:10px;">
                ${data.completion_message}
            </p>

        </div>

        <div style="
            text-align:center;
            margin-top:25px;
        ">

            <button
                onclick="goBack()"
                style="
                    background:#2563eb;
                    color:white;
                    border:none;
                    padding:12px 35px;
                    border-radius:8px;
                    cursor:pointer;
                    font-size:16px;
                    font-weight:bold;
                ">
                ← BACK
            </button>

        </div>

    </div>
    `;

    document.getElementById("contentArea").innerHTML = html;
}

function toggleSection(id) {

    const sections = document.querySelectorAll(".rapidfire-body");
    const icons = document.querySelectorAll(".rapidfire-icon");

    sections.forEach(section => {

        if (section.id !== id) {
            section.style.maxHeight = "0px";
            section.style.paddingTop = "0px";
            section.style.paddingBottom = "0px";
        }

    });

    icons.forEach(icon => {

        if (icon.id !== id + "_icon") {
            icon.style.transform = "rotate(0deg)";
            icon.innerHTML = "▶";
        }

    });

    const body = document.getElementById(id);
    const icon = document.getElementById(id + "_icon");

    if (!body || !icon) return;

    if (body.style.maxHeight && body.style.maxHeight !== "0px") {

        body.style.maxHeight = "0px";
        body.style.paddingTop = "0px";
        body.style.paddingBottom = "0px";

        icon.innerHTML = "▶";
        icon.style.transform = "rotate(0deg)";

    } else {

        body.style.maxHeight = body.scrollHeight + "px";
        body.style.paddingTop = "20px";
        body.style.paddingBottom = "20px";

        icon.innerHTML = "▼";
        icon.style.transform = "rotate(90deg)";

    }
}

/* GO BACK */
function goBack() {

    document.getElementById("contentArea").innerHTML = `
        <h2>Welcome</h2>
        <p>Select a module from menu.</p>
    `;
}


/* EXPORT */
window.loadRapidfireSection = loadRapidfireSection;
window.renderRapidfireQuestions = renderRapidfireQuestions;
window.toggleSection = toggleSection;
window.goBack = goBack;
