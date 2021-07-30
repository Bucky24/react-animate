import animator from './src/Animator.js';
import { useState, useEffect, useRef } from 'react';

export const Animator = animator;

const useForceRender = () => {
    const [renderTick, setRenderTick] = useState(0);

    return () => {
        setRenderTick((tick) => {
            return tick + 1;
        });
    }
}

const getAnimator = (animatorObj, forceRender) => {
    return {
        animate: animatorObj ? animatorObj.animate.bind(animatorObj) : () => { return {}; },
        moveTo: (frame) => {
            if (animatorObj) {
                animatorObj.moveTo(frame);
                forceRender();
            }
        },
        playTo: (frame) => {
            if (animatorObj) {
                animatorObj.playTo(frame);
                forceRender();
            }
        },
    };
}

export const useAnimator = function({ config, autoPlay, frameDelay }) {
    const forceRender = useForceRender();
    const animatorRef = useRef(new Animator((tick) => {
        forceRender();
    }));
    const animatorObj = getAnimator(animatorRef.current, forceRender);

    const doSetup = () => {
        animatorRef.current.setConfig(config);
        animatorRef.current.setAutoPlay(autoPlay);
        animatorRef.current.setFrameDelay(frameDelay);
        forceRender();
    }
    
    useEffect(() => {
        doSetup();
    }, [config, autoPlay, frameDelay]);
    
    useEffect(() => {
        doSetup();

        return () => {
            if (animatorRef.current) {
                animatorRef.current.release();
                animatorRef.current = null;
            }
        }
    }, []);
    
    return animatorObj;
}