import { useEffect, useState } from "react";
import { Rating } from "react-simple-star-rating";
import { showError, showInfo, showSuccess, showWarning } from "./alerts";

export const Place = () => {

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [data, setData] = useState([]);
  const [about, setAbout] = useState()
  const [img, setImg] = useState([]);
  const [rating, setRating] = useState(0);
  const [wifi, setWifi] = useState(false);
  const [gaming, setGaming] = useState(false);
  const [meeting, setMeeting] = useState(false);
  const [city, setCity] = useState("");
  const [img2, setImg2] = useState(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const handlePlaceImages = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImg((prevImages) => [...prevImages, ...selectedImages]);
    e.target.value = "";
  };

  // GET USER LOCATION + ADDRESS
  useEffect(() => {

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({
          lat,
          lng
        });

        try {

          // REVERSE GEOCODING
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const result = await response.json();

          setAddress(result.display_name);

        } catch (error) {

          console.log(error);

        }

      },

      (error) => {
        console.log(error);
      }

    );

  }, []);

  // GET PLACE TYPES
  useEffect(() => {
    show();
  }, []);

  // STAR RATING
  const handleRating = (rate) => {
    setRating(rate);
  };

  // ADD PLACE
  const add = async (e) => {

    e.preventDefault();

    if (!img || img.length === 0) {
      showWarning("Images Required", "Please select at least one place image.");
      return;
    }

    if (!location) {
      showInfo("Location Loading", "Please wait until your current location is available.");
      return;
    }

    try {

      const formData = new FormData();

      formData.append("name", name);
      formData.append("type", type);
      formData.append("about", about)
      formData.append("address", address);
      formData.append("lat", JSON.stringify(location.lat))
      formData.append("lng", JSON.stringify(location.lng))
      formData.append("rating", rating);
      formData.append("city", city);
      formData.append("wifi", wifi);
      formData.append("gaming", gaming);
      formData.append("meeting", meeting);
      for (let i = 0; i < img.length; i++) {
        formData.append("images", img[i]);
      }
      const result = await fetch("https://cafefinder-u2me.onrender.com/api/place",
        {
          method: "post",
          body: formData
        }
      );
      const res = await result.json();
      if (res.statuscode === 1) {
        showSuccess("Place Added", "Your new place has been added successfully.");
      } else {
        showError("Place Not Added", "Please check the place details and try again.");
      }
    } catch (error) {
      console.log(error);
    }

  };

  // ADD CATEGORY
  const add2 = async (e) => {
    e.preventDefault();
    if (!img2) {
      showWarning("Image Required", "Please select a category image.");
      return;
    }
    try {
      const form = new FormData();
      form.append("category", category);
      form.append("pic", img2);
      const result = await fetch(
        "https://cafefinder-u2me.onrender.com/api/category",
        {
          method: "POST",
          body: form
        }
      );
      const res = await result.json();
      if (res.statuscode === 1) {
        showSuccess("Category Added", "The category has been saved successfully.");
      } else {
        showError("Category Not Added", "Please try again.");
      }
    } catch (error) {
      console.log(error);
    }

  };

  // SHOW CATEGORY
  const show = async () => {

    try {

      const result = await fetch(
        "https://cafefinder-u2me.onrender.com/api/getcat"
      );

      const res = await result.json();

      if (res.statuscode === 1) {

        setData(res.data);

      } else {

        showInfo("No Categories Found", "Add a category to start listing places.");

      }
    } catch (error) {

      console.log(error);

    }

  };

  

  return (
    <>
      <section className="content-section">
      <div className="container">

        <div className="row g-4 g-lg-5">

          {/* ADD PLACE */}
          <div className="col-lg-7">

            <form className="form-panel" onSubmit={add}>
              <p className="section-kicker">New listing</p>
              <h1 className="mb-4">Add Place</h1>

              {/* PLACE NAME */}
              <input
                className="form-control w-100 mb-3"
                type="text"
                placeholder="Enter Place Name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="form-control w-100 mb-3"
                type="text"
                placeholder="Enter About  Place "
                onChange={(e) => setAbout(e.target.value)}
              />

              {/* PLACE TYPE */}
              <select
                className="form-select mb-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >

                <option>Select Type</option>

                {data.map((a) => (
                  <option value={a._id} key={a._id}>
                    {a.Type}
                  </option>
                ))}

              </select>

              {/* CITY */}
              <input
                className="form-control w-100 mb-3"
                placeholder="City or State"
                onChange={(e) => setCity(e.target.value)}
              />

              {/* AUTO LOCATION */}
              <div className="mb-3 text-start">

                <label className="fw-semibold">
                  Current Location:
                </label>

                <p className="text-muted small">
                  {address || "Fetching location..."}
                </p>

              </div>

              {/* FEATURES */}
              <div className="mt-2 d-flex flex-wrap gap-3">

                <div>
                  <label className="form-check-label">
                    WIFI
                  </label>

                  <input
                    className="form-check-input ms-2"
                    checked={wifi}
                    type="checkbox"
                    onChange={(e) => setWifi(e.target.checked)}
                  />
                </div>

                <div>
                  <label className="form-check-label">
                    Gaming
                  </label>

                  <input
                    className="form-check-input ms-2"
                    checked={gaming}
                    type="checkbox"
                    onChange={(e) => setGaming(e.target.checked)}
                  />
                </div>

                <div>
                  <label className="form-check-label">
                    Meeting
                  </label>

                  <input
                    className="form-check-input ms-2"
                    checked={meeting}
                    type="checkbox"
                    onChange={(e) => setMeeting(e.target.checked)}
                  />
                </div>

              </div>

              {/* RATING */}
              <div className="mt-4">

                <label className="fw-semibold">
                  Your Rating:
                </label>

                <Rating
                  onClick={handleRating}
                  allowFraction
                />

              </div>

              {/* IMAGE */}
              <input
                type="file"
                multiple
                className="form-control w-100 mt-4"
                onChange={handlePlaceImages}
              />

              {img.length > 0 && (
                <p className="text-muted small mt-2 mb-0">
                  {img.length} image{img.length > 1 ? "s" : ""} selected
                </p>
              )}

              {/* BUTTON */}
              <button
                className="btn mt-4 btn-primary w-100"
                type="submit"
              >
                Add Place
              </button>

            </form>

          </div>

          {/* ADD CATEGORY */}
          <div className="col-lg-5">
            <form className="form-panel" onSubmit={add2}>
              <p className="section-kicker">Categories</p>
              <h1 className="mb-4">Add Place Type</h1>

              <input
                className="form-control"
                placeholder="Set Place Type"
                onChange={(e) => setCategory(e.target.value)}
              />

              <input
                type="file"
                className="form-control mt-3"
                onChange={(e) => setImg2(e.target.files[0])}
              />

              <button
                className="btn btn-primary mt-3 w-100"
                type="submit"
              >
                Add Type
              </button>

            </form>

          </div>

        </div>

      </div>
      </section>
    </>
  );
};
