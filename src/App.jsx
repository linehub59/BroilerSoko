
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  Search,
  MapPin,
  MessageCircle,
  ShoppingBasket,
  Truck,
  PackageCheck,
  ShieldCheck,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { db } from "./config/Firebase";

const demoListings = [
  {
    id: "demo-1",
    productName: "Dressed Broiler Chicken",
    pricePerKg: 350,
    averageWeightKg: 2,
    quantityAvailable: 50,
    location: "Nakuru",
    sellerPhone: "254700000001",
    deliveryAvailable: true,
    collectionAvailable: true,
    description: "Sample listing. Price and availability must be confirmed.",
    demo: true,
  },
  {
    id: "demo-2",
    productName: "Fresh Dressed Broilers",
    pricePerKg: 380,
    averageWeightKg: 1.8,
    quantityAvailable: 25,
    location: "Nairobi",
    sellerPhone: "254700000002",
    deliveryAvailable: false,
    collectionAvailable: true,
    description: "Sample listing. Contact the supplier to confirm details.",
    demo: true,
  },
  {
    id: "demo-3",
    productName: "Bulk Dressed Broilers",
    pricePerKg: 330,
    averageWeightKg: 2.2,
    quantityAvailable: 100,
    location: "Machakos",
    sellerPhone: "254700000003",
    deliveryAvailable: true,
    collectionAvailable: false,
    description: "Sample bulk listing. Not a verified supplier offer.",
    demo: true,
  },
];

const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function makeWhatsAppLink(item) {
  const phone = String(item.sellerPhone || "").replace(/\D/g, "");
  if (!phone) return "";

  const message = [
    "Hello! I found your listing on Broiler Soko.",
    `Product: ${item.productName}`,
    `Price: ${formatKES(item.pricePerKg)} per kg`,
    `Average weight: ${item.averageWeightKg} kg`,
    `Quantity available: ${item.quantityAvailable} birds`,
    `Location: ${item.location}`,
    "",
    "Please confirm current stock, actual weight, total price, and delivery or collection arrangements.",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [fulfilment, setFulfilment] = useState("all");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const approvedQuery = query(
      collection(db, "listings"),
      where("status", "==", "approved")
    );

    return onSnapshot(
      approvedQuery,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setListings(items);
        setFirebaseReady(true);
      },
      (error) => {
        console.error("Firebase listings error:", error);
        setFirebaseReady(false);
      }
    );
  }, []);
const usingDemo = firebaseReady && listings.length === 0;
  const sourceListings = usingDemo ? demoListings : listings;
  const filteredListings = useMemo(() => {
    const term = search.trim().toLowerCase();
    const town = area.trim().toLowerCase();

    const result = sourceListings.filter((item) => {
      const searchable =
        `${item.productName || ""} ${item.description || ""} ${item.location || ""}`
          .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (!town || String(item.location || "").toLowerCase().includes(town)) &&
        (!maxPrice || Number(item.pricePerKg) <= Number(maxPrice)) &&
        (fulfilment === "all" ||
          (fulfilment === "delivery" && item.deliveryAvailable === true) ||
          (fulfilment === "collection" &&
            item.collectionAvailable === true))
      );
    });

    if (sort === "price-low") {
      result.sort((a, b) => Number(a.pricePerKg) - Number(b.pricePerKg));
    } else if (sort === "price-high") {
      result.sort((a, b) => Number(b.pricePerKg) - Number(a.pricePerKg));
    } else {
      result.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [sourceListings, search, area, maxPrice, fulfilment, sort]);

  const resetFilters = () => {
    setSearch("");
    setArea("");
    setMaxPrice("");
    setFulfilment("all");
    setSort("newest");
  };

  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="#home" aria-label="Broiler Soko home">
          <span className="brandMark"><ShoppingBasket size={25} /></span>
          <span>Broiler <b>Soko</b></span>
        </a>

        <nav className={`nav ${mobileMenu ? "navOpen" : ""}`}>
          <a href="#market" onClick={() => setMobileMenu(false)}>Browse chicken</a>
          <a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
          <a className="sellLink" href="#sell" onClick={() => setMobileMenu(false)}>
            Sell chicken
          </a>
        </nav>

        <button
          className="mobileMenuButton"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label={mobileMenu ? "Close menu" : "Open menu"}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>

      <main id="home">
        <section className="hero">
          <div className="heroContent">
            <div className="eyebrow">
              <span className="liveDot" /> KENYA'S CHICKEN MARKETPLACE
            </div>
            <h1>Good chicken.<br /><span>Better connections.</span></h1>
            <p>
              Discover dressed broiler suppliers, compare prices,
              and order directly. Choose delivery or collect yourself.
            </p>
            <a className="primaryButton" href="#market">
              Find chicken <ShoppingBasket size={18} />
            </a>
            <div className="heroTrust">
              <ShieldCheck size={17} />
              Listings are published after admin approval
            </div>
          </div>

          <div className="heroVisual" aria-label="Chicken marketplace illustration">
            <div className="heroCircle">
              <div className="chickenEmoji">🐔</div>
            </div>
            <div className="floatingCard floatingTop">
              <span className="floatingIcon"><PackageCheck size={19} /></span>
              <span><b>Ready to order</b><small>Contact suppliers directly</small></span>
            </div>
            <div className="floatingCard floatingBottom">
              <span className="floatingIcon yellow"><Truck size={19} /></span>
              <span><b>Your choice</b><small>Delivery or collection</small></span>
            </div>
          </div>
        </section>

        

        <section id="market" className="market">
          <div className="sectionTop">
            
            <div className="resultCount">
              <span>{filteredListings.length}</span> listings
            </div>
          </div>

          {usingDemo && (
            <div className="demoNotice">
              <ShieldCheck size={18} />
              <span>
                <b>Preview mode:</b> These are illustrative sample listings,
                not confirmed supplier offers. Real approved listings will
                appear here once sellers join.
              </span>
            </div>
          )}

          {!firebaseReady && (
            <div className="connectionNotice">
              Connecting to the marketplace…
              Check your Firebase configuration if this continues.
            </div>
          )}

          <div className="searchPanel">
            <label className="searchInput">
              <Search size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What chicken are you looking for?"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={17} />
                </button>
              )}
            </label>
            <button className="filterToggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} /> Filters
              <ChevronDown size={16} />
            </button>
          </div>

          <div className={`filterPanel ${showFilters ? "filterPanelOpen" : ""}`}>
            <label>
              <span>Town or county</span>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Nairobi, Nakuru"
              />
            </label>
            <label>
              <span>Maximum price per kg (KSh)</span>
              <input
                type="number"
                min="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any price"
              />
            </label>
            <label>
              <span>Fulfilment</span>
              <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value)}>
                <option value="all">All options</option>
                <option value="delivery">Delivery available</option>
                <option value="collection">Collection available</option>
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest listings</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
            <button className="resetButton" onClick={resetFilters}>Reset filters</button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon"><ShoppingBasket size={32} /></div>
              <h3>No chicken listings found</h3>
              <p>Try changing your search or removing some filters.</p>
              <button className="outlineButton" onClick={resetFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="productGrid">
              {filteredListings.map((item) => (
                <article className="productCard" key={item.id}>
                  <button
                    className="productImage"
                    onClick={() => setSelected(item)}
                    aria-label={`View ${item.productName}`}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} loading="lazy" />
                    ) : (
                      <span className="productEmoji">🐔</span>
                    )}
                    <span className="stockBadge">Available</span>
                  </button>

                  <div className="productBody">
                    <div className="productLocation">
                      <MapPin size={14} /> {item.location}
                    </div>
                    <button className="productTitle" onClick={() => setSelected(item)}>
                      {item.productName}
                    </button>
                    <div className="productPrice">
                      {formatKES(item.pricePerKg)}
                      <small> / kg</small>
                    </div>
                    <div className="productFacts">
                      <span>{item.averageWeightKg} kg <small>average</small></span>
                      <span>{item.quantityAvailable} <small>birds</small></span>
                    </div>

                    <div className="optionTags">
                      {item.deliveryAvailable && <span><Truck size={14} /> Delivery</span>}
                      {item.collectionAvailable && <span><PackageCheck size={14} /> Collection</span>}
                    </div>

                    <button className="detailsButton" onClick={() => setSelected(item)}>
                      View details
                    </button>
                    {makeWhatsAppLink(item) ? (
                      <a
                        className="whatsappButton"
                        href={makeWhatsAppLink(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={18} /> Contact seller
                      </a>
                    ) : (
                      <button className="whatsappButton disabledButton" disabled>
                        Seller contact unavailable
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="how" className="howSection">
          <div className="eyebrow">SIMPLE & DIRECT</div>
          <h2>How Broiler Soko works</h2>
          <div className="stepsGrid">
            <div className="step"><span>01</span><h3>Explore</h3><p>Compare chicken prices, weights, stock and supplier locations.</p></div>
            <div className="step"><span>02</span><h3>Contact</h3><p>Send a WhatsApp enquiry and confirm the stock is available.</p></div>
            <div className="step"><span>03</span><h3>Arrange</h3><p>Agree on quantity, total cost, delivery or collection and payment.</p></div>
          </div>
        </section>

        <section id="sell" className="sellerCallout">
          <div>
            <div className="eyebrow">ARE YOU A POULTRY SUPPLIER?</div>
            <h2>Turn your stock into sales.</h2>
            <p>Join the marketplace and connect with potential chicken buyers.</p>
          </div>
          <a className="primaryButton" href="mailto:hello@broilersoko.co.ke?subject=Broiler%20Soko%20Seller%20Registration">
            Register interest <MessageCircle size={18} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footerBrand" href="#home">
          <span className="brandMark"><ShoppingBasket size={23} /></span>
          <span>Broiler <b>Soko</b></span>
        </a>
        <p>Connecting dressed-chicken buyers with local suppliers.</p>
        <small>
          Confirm availability, actual weight, safe handling, total price,
          and delivery terms directly with the seller.
        </small>
        <div className="copyright">© {new Date().getFullYear()} Broiler Soko</div>
      </footer>

      {selected && (
        <div className="modalBackdrop" onClick={() => setSelected(null)}>
          <section
            className="detailModal"
            role="dialog"
            aria-modal="true"
            aria-label="Chicken listing details"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modalClose" onClick={() => setSelected(null)} aria-label="Close details">
              <X />
            </button>
            <div className="modalImage">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.productName} />
              ) : (
                <span>🐔</span>
              )}
            </div>
            <div className="productLocation"><MapPin size={15} /> {selected.location}</div>
            <h2>{selected.productName}</h2>
            <div className="productPrice">{formatKES(selected.pricePerKg)}<small> / kg</small></div>
            <div className="detailFacts">
              <div><small>Average bird weight</small><b>{selected.averageWeightKg} kg</b></div>
              <div><small>Available quantity</small><b>{selected.quantityAvailable} birds</b></div>
            </div>
            <p>{selected.description || "Contact the seller to confirm product and handling details."}</p>
            <div className="optionTags">
              {selected.deliveryAvailable && <span><Truck size={15}/> Delivery available</span>}
              {selected.collectionAvailable && <span><PackageCheck size={15}/> Collection available</span>}
            </div>
            {makeWhatsAppLink(selected) && (
              <a className="whatsappButton" href={makeWhatsAppLink(selected)} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18}/> Enquire on WhatsApp
              </a>
            )}
            <small className="modalNote">Confirm the final price, stock, weight, packaging and payment terms before paying.</small>
          </section>
        </div>
      )}
    </div>
  );
}
