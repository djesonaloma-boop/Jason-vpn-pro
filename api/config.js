export default function handler(req, res) {
  const servers = {
    ca:{id:"CA-FREE#5",endpoint:"149.88.97.122:51820",pub:"mS8GfqvUvazXvSYg7VHV7s8eEyU0yyGjJwYgdjHq23A=",priv:"GASGaC1ulBmnyXFSUtEc2yzL7R3PlSpdaCQrJeWY0WI="},
    us:{id:"US-FREE#44",endpoint:"37.19.221.196:51820",pub:"4wqoqnWaoR8FLWkihmN4DVma/8lFn1fXQMRVs/4TD0A=",priv:"CJC+4mHotZ6hy2qlqYavbyOhnU9cx9Btczj7Fka0dHc="},
    jp:{id:"JP-FREE#17",endpoint:"193.148.16.2:51820",pub:"5fFhuzIQPu8C4tySJuCJYg/13g75APFtMnqn3oeCpxk=",priv:"oLNIduV7OEhKQUmKJhE5FF6Ts9cgDXotNXZEA3plmk4="},
    ch:{id:"CH-FREE#3",endpoint:"138.199.6.178:51820",pub:"YpOUROUnumcF/snGX8zka0nThnvHesceJAYUSbZL1XQ=",priv:"aMxY38Nc8ZmflM0OoSdr95hZU0dAS+kOcrmv2tLniH8="},
    mx:{id:"MX-FREE#3",endpoint:"149.102.224.33:51820",pub:"rNyiLhJsBGoHd0A6Yrzt6c5DHuD3urE5+ZN3DZITfD8=",priv:"UDgEIG6fyJRQ8CYdnl0yS7AsxsiNuBjdyT7tBE/9s3w="}
  };
  const country = (req.query.country || 'ca').toLowerCase();
  const s = servers[country];
  if(!s) return res.status(404).json({error:"Serveur inconnu"});
  const conf=`[Interface]
PrivateKey = ${s.priv}
Address = 10.2.0.2/32
DNS = 10.2.0.1
[Peer]
PublicKey = ${s.pub}
Endpoint = ${s.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
  res.setHeader('Content-Type','text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="JASON-${s.id}.conf"`);
  res.setHeader('Access-Control-Allow-Origin','*');
  return res.status(200).send(conf);
}
