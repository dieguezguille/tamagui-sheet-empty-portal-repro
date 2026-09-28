# Closed modal `Sheet` leaves an empty full-screen portal wrapper (native)

Minimal reproduction for a `@tamagui/sheet` bug on React Native: every closed `<Sheet modal unmountChildrenWhenHidden>` still renders a `<Portal>`, and `Portal.native` always wraps its children in a full-screen `View` (`position: absolute`, `inset: 0`, `pointerEvents: box-none`). The sheet content is unmounted, so what stays mounted in the root portal host is one empty full-screen view per closed sheet.

The screen in [`app/sheets.tsx`](app/sheets.tsx) declares four modal sheets: three that are never opened and one you can open and close. With stock tamagui, the portal host ends up holding four empty full-screen views.

## Branches

| Branch     | tamagui               | What it shows                                                                                      |
| ---------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `main`     | 2.7.7 (latest stable) | Stock behavior. `pnpm test` fails: 4 empty wrappers, both before and after opening/closing a sheet. |
| `with-fix` | 2.7.7 + pnpm patch    | Same app with the one-line fix in `patches/`. `pnpm test` passes.                                  |
| `v3-beta`  | 3.0.0-beta.1479.1     | Stock beta. Never-opened sheets now mount their content, but an opened-then-closed sheet still leaves one empty wrapper. |

## Steps

```sh
pnpm install
pnpm test               # main: 2 failed (Expected length: 0, Received length: 4)

git checkout with-fix
pnpm install            # applies patches/@tamagui__sheet@2.7.7.patch
pnpm test               # 2 passed
```

The test ([`sheets.test.tsx`](sheets.test.tsx)) renders the screen inside `TamaguiProvider` and counts host `View`s that are empty and have the wrapper's shape. It needs no simulator.

### On a device or simulator

```sh
pnpm expo run:ios --configuration Release
```

Tap **Go to screen with sheets**. Then do one of the following:

- Open the Xcode view debugger. Next to the navigator you will find four empty full-screen `RCTViewComponentView`s. They are not there on `with-fix`.
- Run `maestro hierarchy`. The iOS accessibility tree has four extra empty elements with the full screen bounds at the root, next to the navigator. They are not there on `with-fix`.

[`.maestro/closed-sheets.yaml`](.maestro/closed-sheets.yaml) checks the app's behavior: tap a button behind the closed sheets, open the sheet, close it and tap again. It passes on both branches, so the fix does not change how sheets behave.

## Expected

A closed modal sheet whose children are unmounted should not mount anything in the portal host.

## Actual

Each closed modal sheet mounts an empty full-screen view in the root portal host. Screens that declare several sheets up front (confirmations, info sheets) pile up N of them on top of the app.

## Fix used in `with-fix`

In `SheetImplementationCustom.native.js`, only render the `Portal` when there is something to portal:

```diff
-    var modalContents = /* @__PURE__ */jsx(Portal, {
+    var modalContents = mountedContents == null ? null : /* @__PURE__ */jsx(Portal, {
```

## Versions

- tamagui / @tamagui/sheet / @tamagui/portal 2.7.7. The same shape is also present in 1.144.4 and in 3.0.0-beta.1479.1.
- expo 57.0.25, expo-router 57.0.23, react-native 0.86.3, react 19.2.3
- iOS 26.5 simulator (iPhone 17 Pro Max), Xcode 27.0, maestro 2.10.0
