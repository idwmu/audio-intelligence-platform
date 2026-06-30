import base from "../assets/turntable-base.svg";
import disk from "../assets/disk.svg";

import "./Turntable.css";

function Turntable({ processing }) {

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
                className={processing ? "disk spinning" : "disk"}
            />

        </div>
    );

}

export default Turntable;