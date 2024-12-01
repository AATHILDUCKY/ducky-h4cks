//
//after listing it will filter by keywords
//
//

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
    contentArea.innerHTML = "";
    const keywords = filter.split(",").map((key) => key.trim().toLowerCase());

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

  // Parse Content to Handle <copycode>, <insert>, and <srclink> Tags (Without Encoding)
  const parseCopyCode = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Handle <copycode> Tags
    doc.querySelectorAll("copycode").forEach((tag) => {
      const codeContainer = document.createElement("div");
      codeContainer.className =
        "bg-gray-900 text-[#94f725] rounded p-2 mt-2 flex justify-between items-center";

      // Directly set the HTML content without encoding
      const codeContent = tag.innerHTML; // Use innerHTML here to avoid encoding

      codeContainer.innerHTML = `
        <code class="font-mono text-sm">${codeContent}</code>
        <button class="copy-btn text-teal-500">
          <i class="fas fa-copy"></i>
        </button>
      `;
      tag.replaceWith(codeContainer);

      // Add Copy Functionality
      codeContainer.querySelector(".copy-btn").addEventListener("click", () => {
        // Copy the content of the <copycode> tag to the clipboard
        navigator.clipboard.writeText(codeContent);
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
            `<pre class="bg-gray-900 text-white p-2 rounded">${fileContent}</pre>`
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
  renderContent();
}
