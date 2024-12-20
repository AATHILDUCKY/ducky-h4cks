// Fetch the notes from the JSON file
fetch("notes.json")
  .then((response) => response.json())
  .then((notes) => {
    initApp(notes);
  });

function initApp(notes) {
  const sidebarList = document.getElementById("sidebarList");
  const sidebarSearch = document.getElementById("sidebarSearch");
  const contentSearch = document.getElementById("contentSearch");
  const contentArea = document.getElementById("contentArea");

  // Render Sidebar Items (with checkboxes for categories)
  const renderSidebar = (filter = "") => {
    sidebarList.innerHTML = "";
    const categories = [...new Set(notes.map((note) => note.category))];

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <div class="bg-gray-700 p-2 rounded-md">
          <label>
            <input type="checkbox" class="mr-2 category-checkbox" data-category="${category}" />
            ${category}
          </label>
        </div>`;
      sidebarList.appendChild(listItem);
    });
  };

  // Render Content Area based on Search and Selected Categories
  const renderContent = (filter = "", selectedCategories = []) => {
    contentArea.innerHTML = ""; // Clear content before rendering new content
    const keywords = filter.split(",").map((key) => key.trim().toLowerCase());

    // Only display content if there's input in the search or selected categories
    if (filter.trim() === "" && selectedCategories.length === 0) {
      return; // Do not show content if no input or category is selected
    }

    notes.forEach((note) => {
      const matchesKeywords =
        keywords.every(
          (key) =>
            note.content.toLowerCase().includes(key) ||
            note.keywords.some((keyword) => keyword.toLowerCase().includes(key))
        ) || keywords[0] === "";

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(note.category);

      if (matchesKeywords && matchesCategory) {
        const contentItem = document.createElement("div");
        contentItem.className = "bg-gray-800 p-4 rounded";
        const parsedContent = parseCopyCode(note.content);

        contentItem.innerHTML = `
          <h2 class="text-xl font-bold mb-2">${note.title}</h2>
          <p class="text-gray-400">${parsedContent}</p>
        `;
        contentArea.appendChild(contentItem);
      }
    });
  };

  // Escape HTML for Safe Display
  const escapeHTML = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>"); // Support new lines

  // Parse Content to Handle <copycode>, <insert>, and <srclink> Tags (Escaped)
  const parseCopyCode = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Handle <copycode> Tags
    doc.querySelectorAll("copycode").forEach((tag) => {
      const codeContainer = document.createElement("div");
      codeContainer.className =
        "bg-gray-900 text-[#94f725] rounded p-2 mt-2 flex justify-between items-center";

      // Escape content for safe display
      const codeContent = escapeHTML(tag.innerHTML);

      codeContainer.innerHTML = `
        <code class="font-mono text-sm">${codeContent}</code>
        <button class="copy-btn text-teal-500">
          <i class="fas fa-copy"></i>
        </button>
      `;
      tag.replaceWith(codeContainer);

      // Add Copy Functionality
      codeContainer.querySelector(".copy-btn").addEventListener("click", () => {
        // Copy the original content of the <copycode> tag to the clipboard
        navigator.clipboard.writeText(tag.innerHTML.trim());
        alert("Code copied to clipboard!");
      });
    });

    // Handle <insert> Tags (to insert content from href)
    doc.querySelectorAll("insert").forEach((tag) => {
      const fileUrl = tag.getAttribute("href");

      // Fetch the content from the specified file URL
      fetch(fileUrl)
        .then((response) => response.text())
        .then((fileContent) => {
          tag.replaceWith(
            `<pre class="bg-gray-900 text-white p-2 rounded">${escapeHTML(
              fileContent
            )}</pre>`
          );
        })
        .catch((err) => {
          console.error("Error fetching file:", err);
          tag.replaceWith(
            "<span class='text-red-500'>Error loading content</span>"
          );
        });
    });

    // Handle <srclink> Tags (create a link with a new tab opening)
    doc.querySelectorAll("srclink").forEach((tag) => {
      const linkHref = tag.getAttribute("href");
      const linkText = tag.textContent || tag.innerHTML;

      const linkElement = document.createElement("a");
      linkElement.href = linkHref;
      linkElement.target = "_blank"; // Open in a new tab
      linkElement.style.color = "orange"; // Set text color to orange
      linkElement.innerHTML = linkText;

      tag.replaceWith(linkElement);
    });

    return doc.body.innerHTML;
  };

  // Event Listeners for Filtering and Search
  sidebarSearch.addEventListener("input", (e) => {
    renderSidebar(e.target.value);
  });

  sidebarList.addEventListener("change", () => {
    const selectedCategories = Array.from(
      document.querySelectorAll(".category-checkbox:checked")
    ).map((checkbox) => checkbox.dataset.category);
    renderContent(contentSearch.value, selectedCategories);
  });

  contentSearch.addEventListener("input", (e) => {
    const selectedCategories = Array.from(
      document.querySelectorAll(".category-checkbox:checked")
    ).map((checkbox) => checkbox.dataset.category);
    renderContent(e.target.value, selectedCategories);
  });

  // Initial Render
  renderSidebar();
  renderContent("", []); // Only render if there's input or category selected
}
