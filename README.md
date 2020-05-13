# useDelayedRender ![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-delayed-render)

useDelayedRender is a react hook for delaying the render and unmount of a component. This is commonly used to animate UI on unmount.

<br />

## Installation

```
$ yarn add use-delayed-render
```

<br />

## Usage

Function signature:

```ts
const { mounted: boolean, rendered: boolean } = useDelayedRender(
  active: boolean,
  options?: {
    enterDelay: number,
    exitDelay: number,
    onUnmount: () => void
  }
)
```

Options:

- `active`: Whether your component is in an active state
- `enterDelay`: After mounting, the delay before `rendered` becomes true
- `exitDelay`: After `rendered` becomes false, the delay before unmounting
- `onUnmount`: A callback triggered after unmounting

Return values:

- `mounted`: Whether your component should be mounted in the DOM
- `rendered`: Whether your component should be visible

<br />

## Example

Render a modal, but delay the unmount so that our 2 second CSS transition completes before the modal is removed from the DOM.

```js
const Modal = ({ active }) => {
  const { mounted, rendered } = useDelayedRender(active, {
    exitDelay: 2000,
  })

  if (!mounted) return null

  return (
    <Portal>
      <div className={rendered ? 'modal visible' : 'modal'}>{/* ... */}</div>
    </Portal>
  )
}
```

This allows you to use simple CSS transitions to animate the mounting/unmounting of your component.

```css
.modal {
  opacity: 0;
  transition: opacity 2s ease;
}

.modal.visible {
  opacity: 1;
}
```

<br />

## Why?

- Usually you would use [`react-transition-group`](https://github.com/reactjs/react-transition-group) to solve this, but the 2.37MB install size is a bit overkill, compared to this package at 491B gzipped.

```jsx
<Transition in={active} unmountOnExit timeout={200} onExited={handleExit}>
  <Modal />
</Transition>
```

- Hooks solve the problem without needing a render function or HOC.
