import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeIn" } },
};

export const cardHoverVariants: Variants = {
  rest:  { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } },
};

export const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28 } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

export const listContainerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const listItemVariants: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export const sidebarVariants: Variants = {
  expanded:  { width: 240, transition: { type: "spring", stiffness: 300, damping: 30 } },
  collapsed: { width: 64,  transition: { type: "spring", stiffness: 300, damping: 30 } },
};

export const sidebarLabelVariants: Variants = {
  expanded:  { opacity: 1, x: 0,   transition: { delay: 0.05, duration: 0.15 } },
  collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
};

export const drawerVariants: Variants = {
  hidden:  { x: "100%", opacity: 0 },
  visible: { x: 0,      opacity: 1, transition: { type: "spring", stiffness: 300, damping: 32 } },
  exit:    { x: "100%", opacity: 0, transition: { duration: 0.2 } },
};