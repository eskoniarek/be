import { 
    AbstractFileService, 
    EventBusService, 
    OrderService,
  } from "@medusajs/medusa"
  import ProductMediaService from "../services/product-media"  // Adjust the path accordingly
  
  type InjectedDependencies = {
    eventBusService: EventBusService
    orderService: OrderService
    fileService: AbstractFileService
    productMediaService: ProductMediaService  // Add this line
  }
  
  class HandleOrderSubscribers {
    protected readonly orderService_: OrderService
    protected readonly fileService_: AbstractFileService
    protected readonly productMediaService_: ProductMediaService  // Add this line
  
    constructor({ 
      eventBusService, 
      orderService, 
      fileService,
      productMediaService,  // Add this line
    }: InjectedDependencies) {
      this.orderService_ = orderService
      this.fileService_ = fileService
      this.productMediaService_ = productMediaService  // Add this line
      eventBusService.subscribe(
        "order.placed", 
        this.handleOrderPlaced
      )
    }
  
    handleOrderPlaced = async (
      data: Record<string, any>
    ) => {
      const order = await this.orderService_.retrieve(data.id, {
        relations: [
          "items", 
          "items.variant",
        ],
      })
  
      // find product medias in the order
      const urls = []
      for (const item of order.items) {
        const productMedias = await this.productMediaService_.list({
          variant_id: item.variant_id
        });
  
        await Promise.all(
          productMedias.map(async (productMedia) => {
            // get the download URL from the file service
            const downloadUrl = await 
              this.fileService_.getPresignedDownloadUrl({
                fileKey: productMedia.file_key,
                isPrivate: true,
              })
  
            urls.push(downloadUrl)
          })
        )
      }
      
      // You can log the URLs or handle further logic if needed
      if (urls.length) {
        console.log('Digital Products URLs:', urls);
      }
    }
  }
  
  export default HandleOrderSubscribers
  