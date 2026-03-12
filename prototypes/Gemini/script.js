document.addEventListener('DOMContentLoaded', () => {
    
    // Select navigation items and all content sections
    const navItems = document.querySelectorAll('.main-nav li');
    const sections = document.querySelectorAll('.content-section');

    // Add click event listener to each navigation item
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            
            // 1. Remove 'active' class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 2. Add 'active' class to the clicked nav item
            item.classList.add('active');

            // 3. Hide all content sections
            sections.forEach(section => section.classList.remove('active'));

            // 4. Show the specific content section related to the clicked tab
            // The data-section attribute on the li maps to the ID of the section
            const sectionToId = item.getAttribute('data-section') + '-section';
            document.getElementById(sectionToId).classList.add('active');
        });
    });
});