import React from 'react';
import Note from "./Note";

const Notefeed = ({notes}) => {

    return (
        <div>
            {notes.map((note) => (
                <div key={note.id} className="note">
                    <Note note={note} />
                </div>
            ))}
        </div>
    )
}

export default Notefeed;