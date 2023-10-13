import { useState } from 'react';
import './App.css';
import { PeculiarFortifyCertificates } from '@peculiar/fortify-webcomponents-react';

function App() {

  const [signature, setSignature] = useState();

  const handleContinue = async (event) => {
    var provider = await event.detail.socketProvider.getCrypto(event.detail.providerId);
    provider.sign = provider.subtle.sign.bind(provider.subtle);

    var cert = await provider.certStorage.getItem(event.detail.certificateId);
    var privateKey = await provider.keyStorage.getItem(event.detail.privateKeyId);
    var certRawData = await provider.certStorage.exportCert('raw', cert);

    const encoder = new TextEncoder();
    const message = "This is a test message";

    const signedContent = await provider.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, encoder.encode(message));

    setSignature(window.btoa(String.fromCharCode.apply(null, new Uint8Array(signedContent))))
  }

  return (
    <div className="App">
      <PeculiarFortifyCertificates
                    id="fortify-certificates-wc"
                    language="en"
                    hideFooter
                    filters={{ 
                        onlySmartcards: true, 
                        onlyWithPrivateKey: true,
                    }}
                    onSelectionSuccess={handleContinue}/>
          <div style={{marginLeft: "40px"}}>
            <div style={{marginBottom: "5px"}}>Signature</div>
            <div style={{width: "200px", wordBreak:"break-all"}}>{signature}</div>
          </div>
    </div>
  );
}


export default App;
