
export function updatePassStatuses(passes) {
  const today = new Date();

  const parseDate = (str) => {
    const [day, month, year] = str.split(".");
    return new Date(`${year}-${month}-${day}`);
  };

  return passes.map(pass => {
    const opensAt = pass.opensAt ? parseDate(pass.opensAt) : null;
    const closesAt = pass.closesAt ? parseDate(pass.closesAt) : null;
    let updatedStatus = pass.status;

    if (opensAt && today >= opensAt) {
      updatedStatus = "open";
    }
    if (closesAt && today >= closesAt) {
      updatedStatus = "closed";
    }

    return { ...pass, status: updatedStatus };
  });
}
