import React, { useEffect, useState } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { Checkbox, Divider, Button, Popover, Spin } from "antd";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "@firebase/firestore";
import { auth, db } from "../../firebase";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { onAuthStateChanged } from "@firebase/auth";
import { Link } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface CartInfo {
  id: string;
  eventId: string;
  clubId: string;
  studentId: string;
  paymentAmount: string;
  paymentDate: string;
  paymentStatus: string;
  paymentDue: string;
  paymentMethod: string;
  eventInfo: EventInfo | undefined; // Updated type to allow undefined
}

interface EventInfo {
  id: string;
  title: string;
  description: string;
  image: string;
  clubId: string;
  logo: string;
  price: string;
  date: string;
  location: string;
}

const CartPage: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState<CartInfo[]>([]);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEvent = async (eventId: string, newEventData: EventInfo[]) => {
    try {
      console.log("handleEvent" + eventId);
      if (eventId) {
        const docRef = doc(db, "Event", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const e = docSnap;
          const event: EventInfo = {
            id: e.id,
            title: e.data().eventName,
            description: e.data().eventDesc,
            image: e.data().eventImage,
            clubId: e.data().clubID,
            logo: "",
            price: "RM" + e.data().eventFee,
            date: "",
            location: "",
          };

          newEventData.push(event);
          return event;
        }
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Error fetching event data");
    }
    // Return undefined if the event data is not found
    return undefined;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
        console.log(user.uid);
      } else {
        setUserID(null);
      }
    });

    // Cleanup function to unsubscribe from the observer when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to run the effect only once on mount

  useEffect(() => {
    const handleLoad = async () => {
      try {
        console.log("handleLoad");
        console.log(userID);
        const q = query(
          collection(db, "Payment"),
          where("paymentStatus", "==", "unpaid"),
          where("studentID", "==", userID)
        );
        const querySnapshot = await getDocs(q);

        const newCartData: CartInfo[] = [];
        const newEventData: EventInfo[] = [];
        let i = 0;

        for (const e of querySnapshot.docs) {
          const cart: CartInfo = {
            id: e.id,
            eventId: e.data().eventID,
            clubId: e.data().clubID,
            studentId: e.data().studentID,
            paymentAmount: e.data().paymentAmount,
            paymentDate: e.data().paymentDate,
            paymentStatus: e.data().paymentStatus,
            paymentDue: e.data().paymentDue,
            paymentMethod: e.data().paymentMethod,
            eventInfo: await handleEvent(e.data().eventID, newEventData),
          };
          i++;

          console.log(await handleEvent(e.data().eventID, newEventData));
          newCartData.push(cart);
        }

        setCartData(newCartData);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError("Error fetching event data");
      } finally {
        setLoading(false);
      }
    };
    handleLoad();
  }, [userID]);

  useEffect(() => {
    const totalItems = cartData.length;
    const checkedItems = checkedList.length;

    setIndeterminate(checkedItems > 0 && checkedItems < totalItems);
    setCheckAll(checkedItems === totalItems);
  }, [checkedList, cartData]);

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const allEventIds = cartData.map((item) => item.eventId);

    setCheckedList(e.target.checked ? allEventIds : []);
  };

  const onChange = (eventId: string) => {
    const newCheckedList = [...checkedList];
    const index = newCheckedList.indexOf(eventId);

    if (index === -1) {
      newCheckedList.push(eventId);
    } else {
      newCheckedList.splice(index, 1);
    }

    setCheckedList(newCheckedList);
  };

  const content = (cartItem: CartInfo) => (
    <div
      className="card"
      style={{
        width: "18rem",
        marginRight: "30px",
        backgroundColor: "snow",
      }}
    >
      <Link
        to={`/event/${cartItem.eventId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
          src={
            cartItem.eventInfo?.image !== ""
              ? cartItem.eventInfo?.image
              : "../../../public/event.png"
          }
          className="card-img-top"
          alt="..."
          style={{ width: "286px", height: "250px" }}
        />
        <div className="card-body">
          <h5 className="card-title">{cartItem.eventInfo?.title}</h5>
          <p className="card-text">{cartItem.eventInfo?.description}</p>
          <Divider />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <h5 style={{ paddingLeft: "70px" }}>
              <b>{cartItem.eventInfo?.price}</b>
            </h5>
          </div>
        </div>
      </Link>
    </div>
  );

  const handleDelete = async (id: string) => {
    try {
      console.log("handleDelete" + id);
      if (id) {
        const docSnap = await deleteDoc(doc(db, "Payment", id));
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      setError("Error deleting data");
    }
  };

  if (loading) {
    return <Spin size="large" fullscreen />;
  }

  if (error) {
    return <p style={{ color: "white" }}>Error: {error}</p>;
  }

  return (
    <div>
      <NavBar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: "rgba(208,61,86,0.9)",
            height: "150vh",
            width: "98.7vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255)",
              height: "auto",
              width: "50vw",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "40px",
              borderRadius: "15px",
            }}
          >
            <h1
              style={{
                margin: "30px",
              }}
            >
              {" "}
              Cart List
            </h1>
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              Check all
            </Checkbox>
            <Divider />
            {cartData.map((cartItem, index) => (
              <div key={cartItem.id}>
                <Popover placement="right" content={content(cartItem)}>
                  <Button style={{ width: "25vw", height: "7vh" }}>
                    <Checkbox
                      onChange={() => onChange(cartItem.eventId)}
                      checked={checkedList.includes(cartItem.eventId)}
                      style={{
                        width: "25vw",
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "flex-start",
                        flexDirection: "row",
                      }}
                    >
                      <div
                        style={{
                          width: "20vw",
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "stretch",
                          flexDirection: "row",
                        }}
                      >
                        <div>
                          <b style={{ textAlign: "left" }}>
                            {cartItem.eventInfo?.title}
                          </b>
                        </div>
                        <div>
                          <b style={{ textAlign: "right" }}>
                            RM {cartItem.paymentAmount}
                          </b>
                        </div>
                        <div
                          style={{
                            width: "1.9vw",
                            height: "4vh",
                            backgroundColor: "red",
                            border: "2px solid white",
                            borderRadius: "100%",
                          }}
                        >
                          <DeleteOutlined
                            style={{ color: "white" }}
                            onClick={() => handleDelete(cartItem.id)}
                          />
                        </div>
                      </div>
                    </Checkbox>
                  </Button>
                </Popover>
                <Divider />
              </div>
            ))}
            <Button
              type="primary"
              style={{
                width: "20vw",
                height: "7vh",
                backgroundColor: "maroon",
              }}
            >
              Proceed To Pay
            </Button>
            <Divider />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
