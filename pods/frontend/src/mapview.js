import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import { FaLocationArrow, FaCoffee, FaSearch, FaStar } from "react-icons/fa";
import { getApiUrl } from "./apiConfig";
import { showInfo } from "./alerts";

// Haversine formula to compute distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // 1 decimal place (e.g. 2.4 km)
};

export const MapView = () => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const userMarkerRef = useRef(null);

    const [places, setPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [radiusFilter, setRadiusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Debounce search query to prevent map re-renders on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch all places for the map
    const fetchPlaces = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl("/api/allplaces"));
            const data = await res.json();
            if (data.statuscode === 1 && Array.isArray(data.data)) {
                // Ensure coordinates fallback if missing
                const formatted = data.data.map((place, idx) => {
                    let lat = place.Location?.lat;
                    let lng = place.Location?.lng;

                    // Fallbacks spread around central Delhi/cities if coordinates weren't set
                    if (!lat || !lng || (lat === 0 && lng === 0)) {
                        const offsets = [
                            [28.6139, 77.2090], // Connaught Place
                            [28.5355, 77.2410], // Saket
                            [28.5244, 77.1855], // Mehrauli
                            [28.4595, 77.0266], // Gurgaon CyberHub
                            [28.5700, 77.3200], // Noida Sector 18
                            [28.6328, 77.2197], // Barakhamba
                            [28.5672, 77.2433], // Lajpat Nagar
                            [28.6989, 77.1384], // Rohini
                        ];
                        const fallback = offsets[idx % offsets.length];
                        lat = fallback[0] + (Math.random() - 0.5) * 0.02;
                        lng = fallback[1] + (Math.random() - 0.5) * 0.02;
                    }

                    return {
                        ...place,
                        lat: Number(lat),
                        lng: Number(lng),
                    };
                });
                setPlaces(formatted);
            }
        } catch (err) {
            console.error("Failed to fetch places for map:", err);
        }
    }, []);

    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultCenter = [28.6139, 77.2090]; // Delhi center default
        const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 12,
            zoomControl: false,
        });

        // Modern Clean Map Tiles (OpenStreetMap / CartoDB Positron)
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19,
            }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Locate User with HTML5 Geolocation
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            showInfo("Geolocation Not Supported", "Your browser does not support GPS location.");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                const { latitude, longitude } = pos.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });

                    // Render user pulse marker
                    if (userMarkerRef.current) {
                        userMarkerRef.current.remove();
                    }

                    const userIcon = L.divIcon({
                        className: "user-gps-marker",
                        html: `<div class="user-location-pulse"><div class="user-dot"></div></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    });

                    userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
                        .addTo(mapInstanceRef.current)
                        .bindPopup("<b>You are here!</b>");
                }
            },
            (err) => {
                setLocating(false);
                console.warn("Geolocation error:", err.message);
                showInfo("Location Access", "Could not get your exact location. Using default map view.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Calculate distance and filter places
    const placesWithDistance = places.map((place) => {
        const distance = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)
            : null;
        return { ...place, distance: distance ? parseFloat(distance) : null };
    });

    // Filter by debounced search and radius
    const filteredPlaces = placesWithDistance
        .filter((place) => {
            const matchesQuery =
                debouncedSearchQuery === "" ||
                place.Placename?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                place.City?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                place.Address?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

            if (!matchesQuery) return false;

            if (radiusFilter !== "all" && userLocation) {
                const maxKm = parseFloat(radiusFilter);
                if (place.distance === null || place.distance > maxKm) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (a.distance !== null && b.distance !== null) {
                return a.distance - b.distance;
            }
            return 0;
        });

    // Render Markers on Map
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        filteredPlaces.forEach((place) => {
            const isSelected = selectedPlace?._id === place._id;

            const customIcon = L.divIcon({
                className: "custom-cafe-marker-wrapper",
                html: `
                    <div class="cafe-map-pin ${isSelected ? "selected-pin" : ""}">
                        <div class="pin-icon-inner">
                            <span class="pin-symbol">☕</span>
                        </div>
                        <div class="pin-callout">${place.Placename}</div>
                    </div>
                `,
                iconSize: [42, 54],
                iconAnchor: [21, 50],
                popupAnchor: [0, -45],
            });

            const marker = L.marker([place.lat, place.lng], { icon: customIcon });

            const popupContent = `
                <div class="map-popup-card">
                    <img src="${place.Image?.[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'}" alt="${place.Placename}" class="map-popup-img" />
                    <div class="map-popup-body">
                        <h6 class="map-popup-title">${place.Placename}</h6>
                        <div class="map-popup-rating">
                            ⭐ ${place.Rating || "4.5"} ${place.City ? `• ${place.City}` : ""}
                        </div>
                        <p class="map-popup-address">${place.Address || ""}</p>
                        ${place.distance ? `<div class="map-popup-distance">📍 ${place.distance} km away</div>` : ""}
                        <a href="/place/${place._id}" class="btn btn-sm btn-primary w-100 mt-2">View Cafe & Menu</a>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { maxWidth: 280, className: "custom-leaflet-popup" });

            marker.on("click", () => {
                setSelectedPlace(place);
            });

            markersLayerRef.current.addLayer(marker);
        });

        // Fit map bounds if places exist
        if (filteredPlaces.length > 0 && !userLocation) {
            const group = L.featureGroup(markersLayerRef.current.getLayers());
            if (group.getBounds().isValid()) {
                mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 14 });
            }
        }
    }, [filteredPlaces, selectedPlace, userLocation]);

    // Pan to place when clicked from list
    const handleSelectPlaceFromList = (place) => {
        setSelectedPlace(place);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([place.lat, place.lng], 15, { duration: 1.2 });
        }
    };

    return (
        <section className="interactive-map-section py-5">
            <div className="container">
                {/* Header & Controls */}
                <div className="row align-items-center justify-content-between mb-4 g-3">
                    <div className="col-lg-6">
                        <span className="section-kicker">Interactive Exploration</span>
                        <h2 className="fw-bold m-0">Find Cafes & Workspaces Near You</h2>
                        <p className="text-muted mt-1 mb-0">
                            Explore work-friendly cafes on an interactive live map or filter by distance.
                        </p>
                    </div>
                    <div className="col-lg-6 d-flex flex-wrap align-items-center justify-content-lg-end gap-2">
                        <button
                            className={`btn ${userLocation ? "btn-success" : "btn-primary"} d-flex align-items-center gap-2 shadow-sm`}
                            onClick={handleLocateMe}
                            disabled={locating}
                        >
                            <FaLocationArrow className={locating ? "fa-spin" : ""} />
                            {locating ? "Detecting GPS..." : userLocation ? "Location Active" : "Find Near Me"}
                        </button>

                        <div className="btn-group shadow-sm" role="group">
                            {["all", "5", "10", "25"].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    className={`btn btn-sm ${radiusFilter === r ? "btn-dark active" : "btn-outline-secondary"}`}
                                    onClick={() => setRadiusFilter(r)}
                                    title={r === "all" ? "All Cafes" : `Within ${r}km`}
                                >
                                    {r === "all" ? "All" : `< ${r}km`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="row mb-4">
                    <div className="col-md-8 col-lg-6">
                        <div className="input-group map-search-bar shadow-sm">
                            <span className="input-group-text bg-transparent border-end-0">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by cafe name, city, or locality..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="btn btn-outline-secondary" onClick={() => setSearchQuery("")}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-6 text-md-end mt-2 mt-md-0 d-flex align-items-center justify-content-md-end">
                        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                            Showing {filteredPlaces.length} cafes on map
                        </span>
                    </div>
                </div>

                {/* Map View & Sidebar */}
                <div className="row g-4 map-layout-row">
                    {/* The Leaflet Map */}
                    <div className="col-lg-8">
                        <div className="map-view-wrapper shadow rounded-4 overflow-hidden position-relative">
                            <div ref={mapContainerRef} className="map-canvas-container" style={{ height: "550px", width: "100%" }} />
                            
                            {/* Floating Map Legend */}
                            <div className="map-floating-legend">
                                <div className="legend-item">
                                    <span className="legend-icon cafe-dot"></span> Cafe / Workspace
                                </div>
                                {userLocation && (
                                    <div className="legend-item">
                                        <span className="legend-icon user-dot"></span> Your GPS Location
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nearby Places List */}
                    <div className="col-lg-4">
                        <div className="map-sidebar-card shadow rounded-4 p-3 bg-card h-100 d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                <h5 className="fw-bold mb-0">Nearby Workplaces</h5>
                                <small className="text-muted">
                                    {userLocation ? "Sorted by distance" : "Click to inspect"}
                                </small>
                            </div>

                            <div className="nearby-places-scroll flex-grow-1" style={{ maxHeight: "470px", overflowY: "auto" }}>
                                {filteredPlaces.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <FaCoffee className="fs-1 mb-2 opacity-50" />
                                        <p>No cafes found matching current radius or search criteria.</p>
                                    </div>
                                ) : (
                                    filteredPlaces.map((place) => {
                                        const isSelected = selectedPlace?._id === place._id;
                                        return (
                                            <div
                                                key={place._id}
                                                className={`nearby-place-item p-3 mb-2 rounded-3 transition-all cursor-pointer ${
                                                    isSelected ? "active-place-item shadow-sm" : ""
                                                }`}
                                                onClick={() => handleSelectPlaceFromList(place)}
                                            >
                                                <div className="d-flex gap-3 align-items-center">
                                                    <img
                                                        src={place.Image?.[0] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                                                        alt={place.Placename}
                                                        className="rounded-3 object-fit-cover"
                                                        style={{ width: "65px", height: "65px" }}
                                                    />
                                                    <div className="flex-grow-1 min-w-0">
                                                        <h6 className="fw-bold text-truncate mb-1">{place.Placename}</h6>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <span className="badge bg-warning-subtle text-warning-emphasis d-flex align-items-center gap-1">
                                                                <FaStar size={10} /> {place.Rating || "4.5"}
                                                            </span>
                                                            {place.distance !== null && (
                                                                <span className="badge bg-info-subtle text-info-emphasis">
                                                                    📍 {place.distance} km
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-muted small text-truncate mb-0">
                                                            {place.Address || place.City || "Work-ready cafe"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                                        <span className="small text-muted">{place.City}</span>
                                                        <Link to={`/place/${place._id}`} className="btn btn-sm btn-primary">
                                                            View Details & Menu &rarr;
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
