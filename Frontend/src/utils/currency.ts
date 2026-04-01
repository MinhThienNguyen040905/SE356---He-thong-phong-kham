
export function formatVND(
  amount: number | string,
  options?: {
    showSymbol?: boolean; 
    decimals?: number; 
  }
): string {
  const { showSymbol = true, decimals = 0 } = options || {};

  
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  
  if (isNaN(numAmount)) {
    return showSymbol ? "0 VND" : "0";
  }

  
  const formatted = numAmount.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${formatted} VND` : formatted;
}


export function formatVNDShort(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return "0 VND";

  if (numAmount >= 1000000000) {
    
    return `${(numAmount / 1000000000).toFixed(1)}B VND`;
  } else if (numAmount >= 1000000) {
    
    return `${(numAmount / 1000000).toFixed(1)}M VND`;
  } else if (numAmount >= 1000) {
    
    return `${(numAmount / 1000).toFixed(0)}K VND`;
  }

  return `${numAmount.toLocaleString("vi-VN")} VND`;
}


export function parseVND(vndString: string): number {
  
  const cleaned = vndString.replace(/VND|,|\.|\s/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
