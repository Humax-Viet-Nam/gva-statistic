import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import Dropzone from "react-dropzone";
import { parseExcel } from './excel';

function App() {

    const [disable, setDisable] = useState(false);

    const [loading, setLoading] = useState(false);

    const [data, setData] = useState([]);

    const onDrop = (files) => {
        setLoading(true);
        parseExcel(files[0], (d) => {
            setData(d);
            setLoading(false);
        });
    }
    return (
        <div className="App">
            <div className="flex">
       
                <Dropzone onDrop={onDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            <p style={{ borderColor: '#d3d9db' }}>
                                {loading ? 'Đang xử lý ...' : 'Thả file vào đây'}
                                </p>
                        </div>
                    )}
                </Dropzone>
            </div>

            <table>
                <thead>
                    <th>Date</th>
                    <th>User</th>
                    <th>Conversation</th>
                </thead>

                <tbody>
                    {
                        data.map((e, index) => (
                            <tr key={index}>
                                <td>{e.date}</td>
                                <td>{e.user}</td>
                                <td>{e.conversation}</td>
                            </tr>

                        ))
                    }
                </tbody>
            </table>

        </div>
    );
}

export default App;
