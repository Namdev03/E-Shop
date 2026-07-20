import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStoredRole, clearStoredRole } from "../utils/authStorage.js";
import { setAuthChecked, clearAuthenticated } from "../redux/slices/authSlice.js";
import { fetchUserProfile } from "../redux/slices/userSlice.js";
import { fetchSellerProfile } from "../redux/slices/sellerSlice.js";

export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);

  useEffect(() => {
    if (authChecked) return;

    const role = getStoredRole();
    if (!role) {
      dispatch(setAuthChecked());
      return;
    }

    const action = role === "seller" ? fetchSellerProfile() : fetchUserProfile();

    dispatch(action).then((result) => {
      if (result.meta.requestStatus === "rejected") {
        clearStoredRole();
        dispatch(clearAuthenticated());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
