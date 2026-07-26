import { View as RNView, Text as RNText, Pressable as RNPressable, TextInput as RNTextInput, Image as RNImage, ScrollView as RNScrollView, StyleSheet as RNStyleSheet, Animated as RNAnimated, Easing as RNEasing, KeyboardAvoidingView as RNKeyboardAvoidingView, Keyboard as RNKeyboard, Platform as RNPlatform, ActivityIndicator as RNActivityIndicator, useWindowDimensions as RNuseWindowDimensions } from "react-native";
let View = RNView;
let Text = RNText;
let Pressable = RNPressable;
let TextInput = RNTextInput;
let Image = RNImage;
let ScrollView = RNScrollView;
let StyleSheet = RNStyleSheet;
let Animated = RNAnimated;
let Easing = RNEasing;
let KeyboardAvoidingView = RNKeyboardAvoidingView;
let Keyboard = RNKeyboard;
let Platform = RNPlatform;
let ActivityIndicator = RNActivityIndicator;
let useWindowDimensions = RNuseWindowDimensions;
export {ActivityIndicator, Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions};
// ── Factory registry: constructor-type API → factory ─────────────────────────
export const createAnimatedValue   = (initial = 0)              => new Animated.Value(initial);
export const createAnimatedValueXY = (initial = { x: 0, y: 0 }) => new Animated.ValueXY(initial);
