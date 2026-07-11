import { useEffect, useRef, useState } from "react";

import base from "../assets/turntable-base.svg";
import disk from "../assets/disk.svg";

import "./Turntable.css";

const SPIN_DURATION_MS = 15000; // one full rotation, matches the old CSS keyframe timing
const DECEL_EXTRA_DEGREES = 260; // how far the disk coasts before it fully stops

function Turntable({ status }) {

    const [angle, setAngle] = useState(0);
    const [decelerating, setDecelerating] = useState(false);

    const rafRef = useRef(null);
    const startTimeRef = useRef(null);
    const startAngleRef = useRef(0);

    // Continuous spin while processing, tracked in JS so we know the exact
    // angle to hand off to the deceleration transition later.
    useEffect(() => {
        if (status !== "processing") return;

        setDecelerating(false);
        startTimeRef.current = performance.now();
        startAngleRef.current = angle;

        const tick = (now) => {
            const elapsed = now - startTimeRef.current;
            const delta = (elapsed / SPIN_DURATION_MS) * 360;
            setAngle(startAngleRef.current + delta);
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // Ease out to a stop once processing finishes.
    useEffect(() => {
        if (status === "complete") {
            cancelAnimationFrame(rafRef.current);
            setDecelerating(true);
            setAngle((current) => current + DECEL_EXTRA_DEGREES);
        }

        if (status === "idle") {
            cancelAnimationFrame(rafRef.current);
            setDecelerating(false);
        }
    }, [status]);

    return (
        <div className="turntable">

            <img
                src={base}
                alt=""
                className="base"
            />

            <img
                src={disk}
                alt=""
                className={decelerating ? "disk decelerating" : "disk"}
                style={{ transform: `rotate(${angle}deg)` }}
            />

        </div>
    );

}

export default Turntable;