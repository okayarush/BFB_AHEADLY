const clients = new Map();
let nextId = 1;

const addClient = (res) => {
  const id = nextId++;
  clients.set(id, res);
  return id;
};

const removeClient = (id) => {
  clients.delete(id);
};

const publish = (event, payload) => {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const [, client] of clients) {
    client.write(data);
  }
};

const heartbeat = () => {
  for (const [, client] of clients) {
    client.write(': keepalive\n\n');
  }
};

setInterval(heartbeat, 20000);

module.exports = { addClient, removeClient, publish };
