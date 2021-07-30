import React, { useState } from 'react';
import { useAnimator } from '@bucky24/react-animate';

import styles from './styles.css';

const config = {
    0: {
        header: {
            'style.top': 0,
            'style.position': 'fixed',
            'style.height': 60,
            'style.fontSize': 16,
        },
    },
    10: {
        header: {
            'style.top': 'calc(100% - 60px)',
            'style.opacity': 1,
            'style.fontSize': 50,
        },
    },
    15: {
        header: {
            'style.opacity': 0,
        }
    },
    30: {
        header: {
            'style.top': 'calc(100% - 60px)',
            'style.opacity': 0,
        },
    },
    40: {
        header: {
            'style.opacity': 1,
            'style.top': 0,
        },
    }
};

export default function App() {
    const [play, setPlay] = useState(false);
    const animator = useAnimator({ config, autoPlay: play, frameDelay: 100 });
    
	return (<div className={styles.appRoot}>
		<div
            {...animator.animate('header', {
                color: 'blue',
            })}
        >
            Welcome to Animate Test
        </div>
        <div style={{ marginLeft: "200px", marginTop: '100px' }}>
            <button
                onClick={() => {
                    setPlay(true);
                }}
            >
                Play
            </button>
            <button
                onClick={() => {
                    animator.moveTo(40);
                }}
            >
                Goto End
            </button>
            <button
                onClick={() => {
                    animator.moveTo(0);
                    setPlay(false);
                }}
            >
                Reset
            </button>
        </div>
	</div>);
}