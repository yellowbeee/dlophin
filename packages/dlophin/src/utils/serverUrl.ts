import address from 'address'
import url from 'url'

export = (protocol: string, host: string, port: number, pathname = '/') => {
  const newHost = host === '::' || host === '0.0.0.0' ? 'localhost' : address.ip()

  return url.format({protocol, hostname: newHost, port, pathname})
}
