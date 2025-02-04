import React, { useEffect, useMemo, useState } from "react";
import categoriesData from "./data/categories.json";
import { products } from "./data/product.json";
import { FaShoppingCart } from "react-icons/fa";

type Category = {
  id: number;
  name: string;
  sublevels?: Category[];
};

type MenuProps = {
  categories: Category[];
  onClick: (category: Category | null) => void;
};

type MenuItemProps = {
  category: Category;
  onClick: (category: Category | null) => void;
};

type Product = {
  id: string;
  name: string;
  quantity: number;
  price: string;
  available: boolean;
  sublevel_id: number;
};

type CarItem = {
  quantity: number;
  product: Product;
};

const MenuItem: React.FC<MenuItemProps> = ({ category, onClick }) => {
  const [isCollapsed, setCollapsed] = useState(false);

  function handleCollapse(event: React.MouseEvent) {
    event.stopPropagation();
    if (isCollapsed) {
      onClick(null);
    }
    setCollapsed((isCollapsed) => !isCollapsed);
  }

  return (
    <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "15px", // Espacio entre los elementos
      padding: "10px",
      backgroundColor: "#f4f4f9",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra suave
      margin: "10px",
      transition: "all 0.3s ease-in-out", // Transición para efectos suaves
    }}
  >
    <div
      onClick={() => onClick(category)}
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer", // Cambia el cursor para mostrar interactividad
        padding: "5px 10px",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Sombra para darle profundidad
        transition: "background-color 0.3s",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#333333", // Color de texto
        }}
      >
        {category.name}
      </span>
      {category.sublevels && (
        <button
          onClick={handleCollapse}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#007bff", // Fondo azul
            color: "#ffffff", // Texto blanco
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.3s",
          }}
        >
          {isCollapsed ? "Cerrar" : "Abrir"}
        </button>
      )}
    </div>
    {category.sublevels && isCollapsed && (
      <Menu categories={category.sublevels} onClick={onClick} />
    )}
  </div>
  
  
  );
};

const Menu: React.FC<MenuProps> = ({ categories, onClick }) => {
  return (
    <ol>
      {categories.map((category) => (
        <MenuItem key={category.id} category={category} onClick={onClick} />
      ))}
    </ol>
  );
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  // Manejando localStorage
  const [cart, setCart] = useState<Map<Product["id"], CarItem>>(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? new Map(JSON.parse(storedCart)) : new Map();
  });

  // Nuevos estados para filtros
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortByStock, setSortByStock] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  function handleDecrement(product: Product) {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const item = newCart.get(product.id);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          newCart.set(product.id, item);
        } else {
          newCart.delete(product.id);
        }
      }

      return newCart;
    });
  }
   // Esto permite que el carrito persista entre recargas de la página. 
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(Array.from(cart.entries())));
  }, [cart]);


  function handleAddToCart(product: Product) {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const item = newCart.get(product.id);

      if (!item) {
        newCart.set(product.id, { quantity: 1, product });
      } else {
        item.quantity += 1;
        newCart.set(product.id, item);
      }
      return newCart;
    });
  }

  function handleRemoveFromCart(productId: string) {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      newCart.delete(productId);
      return newCart;
    });
  }

  function handleIncrement(product: Product) {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const item = newCart.get(product.id);

      if (!item) {
        newCart.set(product.id, {
          quantity: 1,
          product,
        });
      } else {
        item.quantity += 1;
        newCart.set(product.id, item);
      }

      return newCart;
    });
  }

  console.log(cart);

  //Logica para que aparesca la numeracion en el carrito
  const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);

  // Filtrado con disponibilidad, rango de precios y orden por stock
  const matches = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory
        ? product.sublevel_id === selectedCategory.id
        : true;
      const matchesAvailability =
        availabilityFilter === null || product.available === availabilityFilter;
      const productPrice = Number(product.price.replace(/[^0-9.-]+/g, "")); // Convertir el precio a número

      const matchesPrice =
        priceRange === null ||
        (productPrice >= priceRange[0] && productPrice <= priceRange[1]);

      return matchesCategory && matchesAvailability && matchesPrice;
    });

    // Ordenar por cantidad de stock si está activado
    if (sortByStock) {
      filtered = filtered.sort((a, b) => a.quantity - b.quantity);
    }

    return filtered;
  }, [selectedCategory, availabilityFilter, priceRange, sortByStock]);

  function handleCategoryClick(category: Category | null) {
    setSelectedCategory(category);
  }

  return (
    <div>
      <div style={{ display: "flex",  alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
        <span>FrontEnd Challange</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          alignItems: "flex-end",
          cursor: "pointer",
          
        }}
        onClick={() => setCartOpen(!isCartOpen)}
      >
        <FaShoppingCart />
        <span style={{ marginLeft: "5px" }}>{totalItems}</span>
      </div>

      <Menu
        categories={categoriesData.categories}
        onClick={handleCategoryClick}
      />
      {selectedCategory && (
        <p style={{ display:"flex", justifyContent: "center",  fontSize: "22px" }}>Categoría seleccionada: {selectedCategory.name}</p>
      )}

      {/* Controles de filtro */}
      <div  style={{fontSize: "22px", marginBottom: "2rem" }}>
      <label style={{ marginLeft: "10rem"}}>
          Disponibilidad:
          <select
         
            onChange={(e) =>
              setAvailabilityFilter(
                e.target.value === "null" ? null : e.target.value === "true"
              )
            }
          >
            <option value="null">Todos</option>
            <option value="true">Disponible</option>
            <option value="false">No disponible</option>
          </select>
        </label>

        <label>
          Rango de precios:
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value === "null") setPriceRange(null); // Resetear a "Todos"
              else if (value === "0-3000") setPriceRange([0, 3000]);
              else if (value === "3000-8000") setPriceRange([3000, 8000]);
              else if (value === "8000-19000") setPriceRange([8000, 19000]);
              else setPriceRange(null); // Caso para "Todos"
            }}
          >
            <option value="null">Todos</option>
            <option value="0-3000">$0 - $3000</option>
            <option value="3000-8000">$3000 - $8000</option>
            <option value="8000-19000">$8000 - $19000</option>
          </select>
        </label>

        <label>
          Ordenar por stock:
          <input
            type="checkbox"
            checked={sortByStock}
            onChange={() => setSortByStock(!sortByStock)}
          />
        </label>
      </div>

      {/* Productos filtrados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          border: "1px solid black",
        }}
      >
        {matches.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <div>
              <div
                style={{
                  backgroundColor: "#fff",
                  color: "black",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                <span style={{ fontSize: "18px" }}>{product.name}</span>
                <span style={{ color: "#007bff" }}>{product.price}</span>
              </div>
            </div>
            <div>
              <button onClick={() => handleDecrement(product)}>-</button>
              <span>{cart.get(product.id)?.quantity || 0} </span>

              <button onClick={() => handleIncrement(product)}>+</button>
              <span style={{ fontSize: "14px", color: "#666", padding: "5px" }}>
                ({product.quantity})
              </span>
            </div>
            <button onClick={() => handleAddToCart(product)}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      {/* navbarside */}
      {isCartOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            right: "0",
            width: "300px",
            height: "100vh",
            backgroundColor: "white",
            borderLeft: "1px solid black",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
            padding: "20px",
            overflowY: "auto",
            color: "black"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2>Carrito de Compras</h2>
            <button onClick={() => setCartOpen(false)}>X</button>
          </div>
          {Array.from(cart.values()).map(({ product, quantity }) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <p>{product.name}</p>
                <p>Cantidad: {quantity}</p>
              </div>
              <button onClick={() => handleRemoveFromCart(product.id)}>
                Eliminar
              </button>
            </div>
          ))}
          <button onClick={() => setCart(new Map())}>Realizar compra</button>
        </div>
      )}
    </div>
  );
}

export default App;
