import React, { useState, FC } from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';
import { connectToWebsocket } from '../api';
import axios from 'axios'

export interface LoginFormProps extends React.HTMLProps<HTMLDivElement> {};

const LoginForm: FC<LoginFormProps> = () => {
    const [name, setName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [error, setError] = useState<string>('');

    const login = async (e) => {
        e.preventDefault();
        try {
            const user = {
                name,
                username,
                password,
                token
            }
            const result = await axios.post("http://localhost:8080/api/login", user, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (result.data.status !== "undefined" && result.data.status == "error") {
                setError("Login failed");
            } else {
                setToken(result.data);
                connectToWebsocket(result.data, username);
            }
            } catch (e) {
            setError("Login failed");
            console.log(e);
        }
    }

  return (
    <Container>
        <Row className="justify-content-center">
            <Col md={8}>
                <Form onSubmit={(e) => login(e)}>
                    <FormGroup className="py-3">
                        <Label for="username">Username</Label>
                        <Input type="text" name="username" id="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="py-3">
                        <Label for="Password">Password</Label>
                        <Input type="password" name="password" id="Password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                    </FormGroup>
                    <Button className="my-3">Submit</Button>
                </Form>
                {error && <p>{error}</p>}
            </Col>
        </Row>
    </Container>
  );
};

export default LoginForm;