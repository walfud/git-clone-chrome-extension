use std::io;
use std::io::prelude::*;
use std::io::{Write};
use std::process::Command;

extern crate byteorder;
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};

#[macro_use]
extern crate serde_json;

const ID_ACK: &str = "ack";
const ID_DATA: &str = "data";

fn main() {
    // 4 bytes message length
    let mut stdin = io::stdin();
    let mut buf: [u8; 4] = [0; 4];
    stdin.read_exact(&mut buf).unwrap();
    let msg_len: u32 = (&buf[..]).read_u32::<LittleEndian>().unwrap();

    // Message body
    let mut buf: Vec<u8> = vec![0u8; msg_len as usize];
    stdin.read_exact(&mut buf).unwrap();
    let msg = String::from_utf8(buf).unwrap();

    // ack
    send_back(&json!({
        "id": ID_ACK,
        "msgLen": msg_len,
        "msg": &msg,
    }).to_string());


    //
    let args: Vec<String> = serde_json::from_str(&msg).unwrap();
    let mut command = Command::new(&args[0]);
    for arg in &args[1..] {
        command.arg(&arg);
    }
    let status = command.status().unwrap();
    send_back(&json!({
        "id": ID_DATA,
        "code": &status.code(),
    }).to_string());
}

fn send_back(msg: &String) {
    if msg.is_empty() {
        return;
    }

    let mut len: [u8; 4] = [0u8; 4];
    (&mut len[..]).write_u32::<LittleEndian>((&msg.as_bytes()).len() as u32).unwrap();

    io::stdout().flush().unwrap();
    io::stdout().write_all(&len).unwrap();
    io::stdout().write_all(&msg.as_bytes()).unwrap();
    io::stdout().flush().unwrap();
}