import React, {useReducer, useState, useEffect, useContext} from "react";
import ReqHistoryCard from "../components/ReqHistoryCard";
import { Truck} from 'lucide-react';
import api from "../api/axios";
import { AppContent } from "../context/AppContext";
import LoadingSpinner from "../components/LoadingSpinner";


const initState = {
  address: "",
  material: [],
  weight: null,
  pickup_status: "pending",
  instructions: "",
  scheduled_date: null, 
  time_slot: null,
  created_at: new Date().toLocaleDateString("en-EG", {
    timeZone: "Africa/Cairo",
  }),
};

const reducers = (state, action) => {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, scheduled_date: action.payload };
    case "SET_TIME":
      return { ...state, time_slot: action.payload };
    case "SET_ADDRESS":
      return { ...state, address: action.payload };
    case "SET_MATERIAL":
      const material = action.payload;
      const currentMaterials = state.material;
      
      if (currentMaterials.includes(material)) {
        // Remove if already selected
        return { ...state, material: currentMaterials.filter(m => m !== material) };
      } else {
        // Add if not selected
        return { ...state, material: [...currentMaterials, material] };
      }
    case "SET_WEIGHT":
      return{...state, weight: action.payload};
    case "SET_INSTRUCTIONS":
      return{...state, instructions: action.payload};
    case "RESET_FORM":
      return {
        ...initState,
        created_at: new Date().toLocaleDateString("en-EG", {
          timeZone: "Africa/Cairo",
        })
      };
    default:
      return state;
  }
};

const PickupPage = () => {
  const { userData, isLoggedin, loadingUser } = useContext(AppContent);
  const [state, dispatch] = useReducer(reducers, initState);
  const [submited, setSubmited] = useState(false);
  const [pickupHistory, setPickupHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingPickupId, setEditingPickupId] = useState(null);


//Function to fetch pickups for current user
const fetchMyPickups = async () => {
   console.log("1. isLoggedin:", isLoggedin);
  console.log("2. userData:", userData);
  console.log("3. userId:", userData?.id);
  console.log("4. loadingUser:", loadingUser);
    if(!isLoggedin || !userData?.id) {
      setPickupHistory([]);
      setLoading(false);
      return;
    }
        setLoading(true);
        try {
          const res = await api.get("/pickups/my");
          if(res.data.success){
            const lastThreePickups = res.data.pickups.slice(0, 3);
            setPickupHistory(lastThreePickups);
            console.log("Fetched user pickups:", res.data.pickups);
          }else{
            console.error("Failed to fetch user pickups:", res.data.message);
            setPickupHistory([]);
          }
        } catch (error) {
          console.error("Error fetching user pickups:", error);
          setPickupHistory([]);
        } finally {
          setLoading(false);
        }
}

  // Function to add a new pickup request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmited(true);
    
    // Validation first
    if (!state.scheduled_date || !state.time_slot || !state.address || state.material.length === 0 || !state.weight) {
      setSubmited(false);
      return;
    }
    
    // Log authentication status
    if (!isLoggedin || !userData?._id) {
      console.warn("User not fully authenticated, using fallback user ID for testing");
      console.log("Auth state details:", { isLoggedin, userData, loadingUser });
    }

    // Create pickup data
    try {
const pickupData = {
  address: state.address,
  items: state.material, 
  weight: parseInt(state.weight),
  instructions: state.instructions,
  pickupTime: new Date(state.scheduled_date), 
  time_slot: state.time_slot,
};
      
   let res;
   if(editingPickupId){
    res = await api.put(`/pickups/${editingPickupId}`, pickupData);
    console.log("Pickup updated successfully:", res.data);
    setEditingPickupId(null);
   }
      const response = await api.post("/pickups", pickupData);
      
      console.log("Pickup scheduled successfully:", response.data);
     setSuccess(true)
     setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
      fetchMyPickups(); // Refresh pickup history
      dispatch({type: "RESET_FORM"}); //Rest form
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setSuccess(false);
    } finally {
      setSubmited(false);
    }
  };

  // Load centers and pickup history when component mounts
  useEffect(() => {
    if (isLoggedin && userData?.id && !loadingUser) {
      fetchMyPickups()
    } else {
setPickupHistory([]);
    }
  }, [isLoggedin, userData?.id, loadingUser]);


  //Function to delete a pickup from history after deletion
const handleDeletePickup = (pickupId) => {
  console.log("🗑️ Removing pickup from list:", pickupId);
  setPickupHistory(prev => prev.filter(p => p._id !== pickupId));
  setSuccess(true);
  setTimeout(() => setSuccess(false), 3000);
};

  //Function to edite a pickup - populate form with existing data
const handleUpdatePickup = (pickupData) => {
  console.log("Updating pickup:", pickupData);
  // Populate form with existing data
  dispatch({ type: "SET_ADDRESS", payload: pickupData.address });
  dispatch({ type: "SET_WEIGHT", payload: pickupData.weight });
  dispatch({ type: "SET_TIME", payload: pickupData.time_slot });
  dispatch({ type: "SET_DATE", payload: new Date(pickupData.pickupTime).toISOString().split('T')[0] });
  
  // Set materials
  if (Array.isArray(pickupData.items)) {
    pickupData.items.forEach(item => {
      const material = (item.category || item).toLowerCase();
      dispatch({ type: "SET_MATERIAL", payload: material });
    });
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setEditingPickupId(pickupData.id);
};



  return (
    <section id="pickup" className="mb-10 min-h-screen bg-gray-100 ">
      <div className="flex flex-col gap-2 px-10 mt-10 md:flex-row">
        <div className="bg-white border-none rounded-2xl text-gray-500 p-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-truck-icon"
            >
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" />
              <circle cx="7" cy="18" r="2" />
            </svg>

            <div className="ml-2">
              <h2 className="text-black text-start leading-none">Schedule Pickup</h2>
              <p>Convenient pickup service for your recyclable materials</p>
            </div>
          </div>

          {/* User Status Info */}
          {isLoggedin && userData ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Scheduling as:</span> {userData.name} ({userData.email})
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Note:</span> You can schedule pickups without logging in for testing purposes
              </p>
            </div>
          )}

{/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4 shadow-xl px-5 rounded-[20px] py-5 w-full">
            {/* Date + Time */}
            <div className="flex gap-5 flex-col md:flex-row">
              <div className="flex flex-col items-start gap-2">
                <label htmlFor="date" className="text-black">
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={state.scheduled_date || " "}
                  onChange={(e) => dispatch({type: "SET_DATE", payload: e.target.value})}
                  className="border-none rounded-xl p-2 bg-gray-100 text-gray-500 focus:outline-none focus:border focus:border-2 focus:border-solid focus:border-black transtion duration-100"
                />
              </div>

              <div className="flex flex-col items-start gap-2">
                <label htmlFor="time" className="text-black">
                  Time Slot
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  value={state.time_slot || ""}
                  onChange={(e) => dispatch({type: "SET_TIME", payload: e.target.value})}
                  className="border-none rounded-xl p-2 bg-gray-100 text-gray-500 focus:outline-none focus:border focus:border-2 focus:border-solid focus:border-black transtion duration-100"
                >
                  <option value="" disabled>
                    Select time slot
                  </option>
                  <option value="10AM-12PM">10AM-12PM</option>
                  <option value="4PM-5PM">4PM-5PM</option>
                  <option value="7PM-8PM">7PM-8PM</option>
                </select>
              </div>
            </div>



            {/* Address */}
            <div className="flex flex-col items-start gap-2">
              <label htmlFor="address" className="text-black">
                Pickup Address
              </label>
              <input
                type="text"
                id="address"
                placeholder="Enter your pickup address"
                required
                value={state.address}
                onChange={(e) => dispatch({type: "SET_ADDRESS", payload: e.target.value})}
                className="border-none rounded-xl p-2 bg-gray-100 focus:border focus:border-2 focus:border-solid focus:border-black transtion duration-100 text-gray-500 w-[95%] focus:outline-none"
              />
            </div>

            {/* Material */}
            <div className="flex flex-col items-start gap-2">
              <label htmlFor="material" className="text-black">
                Material for pickup
              </label>

              <div className="flex gap-12 ml-6">
                <div className="flex flex-col items-start gap-2">
                  {["plastic", "glass", "cardboard"].map((item) => (
                    <div key={item}>
                      <input
                        type="checkbox"
                        id={item}
                        value={item}
                        checked={state.material.includes(item)}
                        onChange={(e) => dispatch({type: "SET_MATERIAL", payload: e.target.value})}
                        className="accent-gray-800"
                      />
                      <label htmlFor={item} className="text-black ml-1 capitalize">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-start gap-2">
                  {["paper", "metal", "electronics"].map((item) => (
                    <div key={item}>
                      <input
                        type="checkbox"
                        id={item}
                        value={item}
                        checked={state.material.includes(item)}
                        onChange={(e) =>dispatch({type: "SET_MATERIAL", payload: e.target.value})}
                        className="accent-gray-800"
                      />
                      <label htmlFor={item} className="text-black ml-1 capitalize">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight */}
            <div className="flex flex-col items-start gap-2">
              <label htmlFor="weight" className="text-black">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                placeholder="e.g. 5"
                min={'1'}
                required
                value={state.weight || ""}
                onChange={(e) => dispatch({type: "SET_WEIGHT", payload: e.target.value})}
                className="border-none rounded-xl p-2 bg-gray-100 text-gray-500 w-[95%] focus:outline-none focus:border focus:border-2 focus:border-solid focus:border-black transtion duration-100"
              />
            </div>

            {/* Instructions */}
            <div className="flex flex-col items-start gap-2">
              <label htmlFor="instructions" className="text-black">
                Special Instructions
              </label>
              <textarea
                id="instructions"
                placeholder="Any special instructions for pickup"
                value={state.instructions}
                onChange={(e) => dispatch({type: "SET_INSTRUCTIONS", payload: e.target.value})}
                className="border-2 border-black rounded-2xl p-2 w-[95%] h-16 bg-transparent focus:border focus:border-2 focus:border-solid focus:border-black transtion duration-100"
              ></textarea>
            </div>

            {/* Info */}
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-calendar-days-icon text-black"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
              <p className="text-gray-700">
                Pickup service is available Monday–Saturday, {state.time_slot}. A $5
                service fee applies for pickups under {state.weight} KG.
              </p>
            </div>

            <button
              type="submit"
              disabled={submited}
              className={`w-[95%] mt-2 flex items-center justify-center gap-2 rounded-full p-3 transition-all ${
                submited 
                  ? 'bg-green-600 text-white cursor-wait' 
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              <Truck className="mr-1" /> 
              {submited ? (editingPickupId? 'Updating...' :'Scheduling...' ): (editingPickupId? 'Update' :'Schedule Pickup') }
            </button>
          </form>
        {success && (
          <div className="mt-4 p-4 bg-[rgba(0,0,0,0.2)]  border border-green-200 rounded-lg text-green-800">
            Pickup scheduled successfully! wait for confirmation.
          </div>
        )}
        </div>

        {/* Pickup History */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-4 shadow-xl px-5">
            <div className="text-start mb-4">
              <h3 className="text-black font-semibold">My Pickup History</h3>
              {isLoggedin && userData ? (
                <p className="text-gray-500">
                  Your recent pickup requests and their status
                </p>
              ) : (
                <p className="text-gray-500">
                  Please log in to view your pickup history
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {loadingUser ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading user data...</p>
                </div>
              ) : !isLoggedin ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Please log in to view your pickup history</p>
                  <p className="text-sm text-gray-400 mt-2">You need to be logged in to schedule and track pickups</p>
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <LoadingSpinner />
                </div>
              ) : pickupHistory.length > 0 ? (
                <>
                 
                 {pickupHistory.map((pickup) => (
  <ReqHistoryCard
    key={pickup._id}
    date={new Date(pickup.createdAt).toLocaleDateString("en-EG", {
      timeZone: "Africa/Cairo",
    })}
    material={Array.isArray(pickup.items) 
      ? pickup.items.map(item => item.category || item).join(", ")
      : pickup.items}
    items={pickup.items}
    time={pickup.time_slot}
    status={pickup.status}
    address={pickup.address}
    weight={pickup.weight}
    scheduledDate={new Date(pickup.pickupTime).toLocaleDateString()}
    requestId={pickup._id}
    onDelete={handleDeletePickup}
    onUpdate={handleUpdatePickup}
  />
))}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No pickup history found</p>
                  <p className="text-sm text-gray-400 mt-2">Schedule your first pickup above to get started!</p>
                </div>
              )}
            </div>
            
            {isLoggedin && pickupHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={fetchMyPickups}
                  className="text-green-700 hover:text-green-800 text-sm font-medium transition-colors"
                >
                  Refresh History
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl p-4 text-black space-y-2 shadow-xl px-5">
            {[
              "Convenient door-to-door service",
              "Proper sorting and handling",
              "Flexible scheduling options",
              "Real-time updates",
              "Earn points for every pickup",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg
                  width="30"
                  fill="#004932"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#004932"
                >
                  <path d="M177.6,80.43a10,10,0,1,0-19.5,4.5,60.76,60.76,0,0,1-6,44.5c-16.5,28.5-53.5,38.5-82,22-28.5-16-38.5-53-22-81.5s53.5-38.5,82-22a9.86,9.86,0,1,0,10-17c-38.5-22.5-87-9.5-109.5,29a80.19,80.19,0,1,0,147,20.5Z" />
                </svg>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
 };

export default PickupPage;
