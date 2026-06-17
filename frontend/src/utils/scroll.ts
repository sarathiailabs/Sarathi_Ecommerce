/**
 * Smoothly scrolls to a DOM element with a top offset to clear a sticky header or similar overlays.
 * @param id The DOM element ID.
 * @param offset The scroll offset in pixels (defaults to 95px).
 */
export const scrollToElementWithOffset = (id: string, offset = 95) => {
  const element = document.getElementById(id)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - offset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
