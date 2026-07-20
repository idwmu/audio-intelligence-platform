import "./Header.css";

function Header({ selectedModel, setSelectedModel }) {

    const modelNames = {
        animal: "Animals",
        machine: "Machines",
        human: "Humans",
    };

    return (
        <header className="header">

            <div className="logo-container">

                <h1 className="logo">Whodat</h1>

                <p className="current-model">
                    {modelNames[selectedModel]}
                </p>

            </div>

            <nav>

                <select
                    value={selectedModel}
                    onChange={(e) =>
                        setSelectedModel(e.target.value)
                    }
                    className="model-select"
                >
                    <option value="animal">Animals</option>
                    <option value="machine">Machines</option>
                    <option value="human">Humans</option>
                </select>

            </nav>

        </header>
    );
}

export default Header;