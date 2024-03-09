function expandContent(colorDiv, contentId) {
    var expandedContent = document.getElementById('expandedContent');
    var color = window.getComputedStyle(colorDiv).backgroundColor; // Get the background color of the clicked color square

    // Set the background color of the expanded content
    expandedContent.style.backgroundColor = color;

    // Get the content to display
    var content = document.getElementById(contentId).contentDocument.body.innerHTML;

    // Set the content of the expanded content
    expandedContent.querySelector('.content').innerHTML = content;

    // Show the expanded content
    expandedContent.classList.remove('hidden');
    expandedContent.style.display = 'flex'; // Ensure the expanded content is displayed

    document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling
}

function collapseContent() {
    var expandedContent = document.getElementById('expandedContent');

    // Hide the expanded content
    expandedContent.style.display = 'none';

    document.getElementsByTagName('body')[0].style.overflow = 'auto'; // Allow scrolling
}
