# @bucky24/react-animate
Animation library for React apps

There are probably better animation libraries out there.

`@bucky24/react-animate` allows for keyframe-based animation over standard css properties.

# How To Use

The module currently exports a single hook, `useAnimator`.

```
import { useAnimator } from '@bucky24/react-animate';

export default function Component() {
    const animator = useAnimator({ config, autoPlay: true, frameDelay: 100 });
    
    return <div>
        <div {...animator.animate('id of element')}>content</div>
    </div>;
```

The hook takes three parameters:

| Param | Type | Description |
|----|----|----|
| config | Object | Must confirm to Config below |
| autoPlay | Bool | Indicates if the animation should start playing immediately or not |
| frameDelay | Number | The number of MS in between each tick |



It is recommended that you avoid setting the style property directly of any element you're animating over, though adding classes should work fine.

## Animator

The Animator from `useAnimator` exposes the following methods:

### animate

In order to actually consume the animator, spread the result of `animator.animate('id')` over the element. The id should match the ID in the config, and does not need to match the `id` property set on the element.

| Param | Type | Description |
|----|----|----|
| id | string | The id of the element in the config to get animation data for |
| styles | Object | Optional. Any styles given here will also be applied to the element (overriding anything in the animation) |

### moveTo

The moveTo method takes in a frame, and will immediately jump in time to that frame, setting all applicable properties.

### playTo

The playTo method takes in a frame, and will play until that frame, then stop playback (unless autoPlay is enabled). If the current frame is already past the frame given, nothing will happen.

## Config

The config is the main body of data for the animation system. Note that changing the configuration mid-animation will cause the entire system to reset.

The config is an object of the following format:
```
{
    <keyframe>: {
        "<id>": {
            "<animation key>": <value>
        }
    }
}
```

Keyframes should always be numeric, and represent the tick at which the value should be reached.

### Style keys

Style keys are any valid css style, prepended with `style.`. so in order to set the `color` property, you would set `style.color`. Note these should be React css properties, so use `marginTop`, not `margin-top`.

### Rotation

The `rotation` key will properly handle the rotation of the component, using `transform`. This is a shortcut key to allow the user to do rotations without building the full `transform` string.

## Tips For Use

### Setting a Property Before Use

The animation system will only be able to animate over a property if it was already set. So if you have something like this:

```
{
    10: {
        "id": {
            "width": 400
        }
    }
}
```

Then the system will wait 10 tickets, then set the width to 400. If you want to animate, you need to set the initial value like so:

```
{
    0: {
        "id": {
            "width": 100
        }
    },
    10: {
        "id": {
            "width": 400
        }
    }
}
```

This will animate the width from 100 to 400 over 10 ticks.