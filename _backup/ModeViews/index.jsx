// resources/js/Components/ModeViews/index.jsx

// Exportamos por defecto el contenedor principal (si lo necesitas como default)
import ModeApp from "../ModeViews";
export default ModeApp;

// Exportamos de forma nombrada cada una de las sub-vistas modulares de la carpeta
export { default as BuyerView } from "./BuyerView";
export { default as SellerView } from "./SellerView";
export { default as FavoritesView } from "./FavoritesView";
export { default as MyPropertiesView } from "./MyPropertiesView";
export { default as PropertyCard } from "./PropertyCard";
export { default as PropertyDetailView } from "./PropertyDetailView";
