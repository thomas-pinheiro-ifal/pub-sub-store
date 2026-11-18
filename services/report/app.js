const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
      }
}

async function consume() {
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)

    await (await RabbitMQService.getInstance()).consume(
        process.env.RABBITMQ_QUEUE_NAME,
        async (msg) => {
            try {
                const orderData = JSON.parse(msg.content.toString())

                await updateReport(orderData.products)

                await printReport()

            } catch (error) {
                console.log(`ERROR TO PROCESS REPORT: ${error.message}`)
            }
        }
    )
}

consume()
