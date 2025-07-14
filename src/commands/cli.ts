const command = process.argv[2];

switch (command) {
  case 'app:hello':
    require('./hello.command.ts');
    break;
  default:
    console.log('Command not found');
}