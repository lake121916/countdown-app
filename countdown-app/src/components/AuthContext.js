import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Auth state changed, user:", user ? user.uid : "null");
      
      if (user) {
        try {
          console.log("📋 Fetching user document for:", user.uid);
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          console.log("✅ User document exists:", docSnap.exists());
          
          let userData = {
            uid: user.uid,
            email: user.email,
            role: "normal",
            isAdmin: false,
            isWorker: false,
            isHead: false,
            emailVerified: user.emailVerified,
          };

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("📄 User document data:", data);
            
            const role = data.role?.trim().toLowerCase() || "normal";
            console.log("🎭 User role:", role);

            userData.role = role;
            userData.isAdmin = role === "admin";
            userData.isWorker = role === "worker";
            userData.isHead = role === "head";
            userData.emailVerified = data.emailVerified ?? user.emailVerified;
          } else {
            console.log("❌ No user document found, creating new one...");
            // Create user document if it doesn't exist
            try {
              await setDoc(docRef, {
                email: user.email,
                role: "normal",
                emailVerified: user.emailVerified,
                createdAt: new Date()
              });
              console.log("✅ New user document created successfully");
            } catch (createErr) {
              console.error("❌ Error creating user document:", createErr);
              console.error("Error details:", createErr.code, createErr.message);
            }
          }

          console.log("🎯 Final user data:", userData);
          setCurrentUser(userData);
        } catch (err) {
          console.error("❌ Error in AuthContext:", err);
          console.error("Error details:", err.code, err.message);
          
          // Fallback user data
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: "normal",
            isAdmin: false,
            isWorker: false,
            isHead: false,
            emailVerified: user.emailVerified,
          });
        }
      } else {
        console.log("👤 No user, setting currentUser to null");
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);