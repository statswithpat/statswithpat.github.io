const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('primary-navigation');

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  
  if (navLinks.hasAttribute('hidden')) {
    navLinks.removeAttribute('hidden');
  } else {
    navLinks.setAttribute('hidden', '');
  }
});
