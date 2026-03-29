# spa-foundation

> Lightweight JavaScript package for Single-Page Applications (SPA) with Routing, Sidebar/Shell State, Persistence, Theme Presets, Browser History, Keyboard Shortcuts, and Dialogs. Zero dependencies, no build step.

## Live Demo

[Feature Demo](https://omniscripta.com/spa-foundation/examples/feature-demo/)

---

## Package

This repository contains the `@spa-foundation/core` package.

- JavaScript entry: `@spa-foundation/core`
- CSS entries: `@spa-foundation/core/base.css`, `@spa-foundation/core/shell.css`, `@spa-foundation/core/preset-classic.css`, `@spa-foundation/core/preset-modern.css`
- Module format: ES modules
- Runtime dependencies: none

## Features

`@spa-foundation/core` provides the JavaScript primitives and shell CSS needed to build a Single-Page Application:

- **Routing:** Mounts route views into a single host container and keeps navigation inside the SPA.
- **Shell State:** Tracks shell state such as sidebar open and closed states, including mobile layout.
- **Persistence:** Persists selected theme and shell state across page refreshes.
- **Dialogs:** Handles dialog open and close lifecycle, including draggable dialog behavior.
- **Keyboard Shortcuts:** Binds keyboard shortcuts to routes.
- **Presets & CSS:** Provides base CSS and visual presets for the application shell.

## API Overview

- `RouterCore`: Hash-router handling view mounting and browser history.
- `ShellState`: State primitive managing the sidebar and responsive layout states.
- `DialogService`: Service to programmatically open and close dialogs.
- `ModalController` & `createDialogDragController`: Primitives to attach backdrop, escape-key, and drag-to-move behaviors to custom dialog DOM nodes.
- `createShellPersistence`: Synchronizes shell state and theme selections with LocalStorage.

## Repository Layout

- `core/`: package source, exported CSS, and preset assets
- `examples/feature-demo/`: no-build example app used in the live demo

## Theme Presets

The foundation provides two CSS presets that can be switched at runtime, plus a template for creating your own:

- **Modern**: Light background with dock-style sidebar icons and subtle borders.
- **Classic**: Standard material dashboard layout with contrasting sidebar and active states.
- **Custom**: A `preset-custom.css.template` file is included as a starting point to define your own project-specific design tokens.

## Mobile Layout

The shell adapts to mobile screens below 600px, turning the sidebar into a fixed top bar with an off-canvas menu.
