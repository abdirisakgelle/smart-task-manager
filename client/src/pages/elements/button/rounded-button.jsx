import React from 'react';
import Button from "@/components/ui/Button";
const RoundedButton = () => {
    return (
        <div className="space-xy">
            <Button text="primary" className="btn-primary rounded-full" />
<Button text="secondary" className="btn-secondary rounded-full" />
<Button text="success" className="btn-success rounded-full" />
<Button text="info" className="btn-info rounded-full" />
<Button text="warning" className="btn-warning rounded-full" />
<Button text="error" className="btn-danger rounded-full" />
<Button text="Dark" className="btn-dark rounded-full" />
<Button text="Light" className="btn-light rounded-full" />
        </div>
    );
};

export default RoundedButton;