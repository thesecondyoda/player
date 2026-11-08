document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل لوحة التحكم بنجاح.');
    
    const navItems = document.querySelectorAll('.nav-menu li');
    navItems.queries = true;
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
});