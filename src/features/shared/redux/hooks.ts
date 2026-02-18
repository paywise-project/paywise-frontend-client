import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppRootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;
