/* =========================
   LOAD RECORDING SECTION
========================= */
function loadRecordingSection() {

    fetch("get_item.php?section=recording&file=list.json")
        .then(res => res.json())
        .then(data => {

            const itemList = document.getElementById("itemList");
            itemList.innerHTML = "";

            const groups = {};

            data.forEach(recording => {

                if (!recording.category || !recording.name || !recording.url) {
                    console.warn("Invalid recording:", recording);
                    return;
                }

                if (!groups[recording.category]) {
                    groups[recording.category] = [];
                }

                groups[recording.category].push(recording);

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

                // Recording list
                const list = document.createElement("div");
                list.className = "category-items";
                list.style.display = "none";

                groups[category].forEach(recording => {

                    const btn = document.createElement("button");

                    btn.innerText = recording.name;

                    btn.onclick = function () {
                        openRecording(recording.url);
                    };

                    list.appendChild(btn);

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

            console.error("Recording load error:", err);

            document.getElementById("itemList").innerHTML =
                "<li style='color:red;'>Error loading recordings</li>";

        });

}

/* =========================
   OPEN RECORDING
========================= */
function openRecording(url) {
    window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================
   EXPORT
========================= */
window.loadRecordingSection = loadRecordingSection;
window.openRecording = openRecording;
