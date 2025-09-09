function toggleDropdown(id){
  const panel = document.getElementById(id);
  const heading = event.currentTarget; // relies on inline onclick
  panel.classList.toggle('hidden');
  heading.classList.toggle('open');
}