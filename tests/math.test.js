const { fahrenheitToCelsius, celsiusToFahrenheit } = require('../src/math')

test('celcius to F', ()=>{
    const result = celsiusToFahrenheit(0)
    expect(result).toBe(32)
})

test('Farenheit to C', ()=>{
    const result = fahrenheitToCelsius(32)
    expect(result).toBe(0)
})